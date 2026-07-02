<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Game;
use App\Models\MatchEvent;
use App\Models\MatchPlayer;
use App\Models\Player;
use App\Models\Referee;
use App\Models\Team;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function index()
    {
        return response()->json([
            'matches' => Game::with([
                'homeTeam:id,name,short_name,logo_color,logo_url',
                'awayTeam:id,name,short_name,logo_color,logo_url',
                'championship:id,name,status',
                'referee:id,name'
            ])
                ->orderBy('scheduled_at')
                ->get(),
            'championships' => Championship::with('teams:id,name')->where('status', '!=', 'finished')->get(),
            'teams' => Team::where('active', true)->select('id', 'name', 'short_name', 'logo_color', 'logo_url')->orderBy('name')->get(),
            'referees' => Referee::where('status', 'activo')->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'championship_id' => 'required|exists:championships,id',
            'round' => 'required|integer|min:1',
            'home_team_id' => 'required|exists:teams,id|different:away_team_id',
            'away_team_id' => 'required|exists:teams,id',
            'referee_id' => 'nullable|exists:referees,id',
            'ref1_id' => 'nullable|exists:referees,id',
            'ref2_id' => 'nullable|exists:referees,id',
            'court' => 'nullable|string|max:150',
            'scheduled_at' => 'nullable|date',
            'group_name' => 'nullable|string|max:50',
        ]);

        $match = Game::create($data);

        return response()->json([
            'message' => 'Partido creado.',
            'match' => $match
        ]);
    }

    public function update(Request $request, Game $match)
    {
        // Convert empty strings to null before validation to prevent date/exists rules from failing on ""
        $input = array_map(function ($value) {
            return $value === '' ? null : $value;
        }, $request->all());

        $validator = \Illuminate\Support\Facades\Validator::make($input, [
            'court' => 'nullable|string|max:150',
            'scheduled_at' => 'nullable|date',
            'referee_id' => 'nullable',
            'ref1_id' => 'nullable',
            'ref2_id' => 'nullable',
            'home_score' => 'nullable|integer|min:0',
            'away_score' => 'nullable|integer|min:0',
            'status' => 'nullable|string|in:scheduled,live,finished',
            'stage' => 'nullable|string|max:50',
            'label' => 'nullable|string|max:100',
            'round' => 'nullable|integer|min:1',
            'home_team_id' => 'nullable',
            'away_team_id' => 'nullable',
            'championship_id' => 'nullable',
            'group_name' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        $updateData = [];
        foreach ($validated as $key => $val) {
            if (!is_null($val)) {
                $updateData[$key] = $val;
            }
        }

        $match->update($updateData);

        // Clear public home cache to reflect score/status updates immediately
        \Illuminate\Support\Facades\Cache::forget('public_home_data');

        return response()->json([
            'message' => 'Partido actualizado con éxito.',
            'match' => $match->fresh()
        ]);
    }

    public function getStats(Game $match)
    {
        $match->load(['homeTeam.players', 'awayTeam.players']);
        
        $matchPlayers = MatchPlayer::where('match_id', $match->id)
            ->with('player')
            ->get();
            
        // Get triples (count of score3 events per player)
        $triples = MatchEvent::where('match_id', $match->id)
            ->where('type', 'score3')
            ->selectRaw('player_id, COUNT(id) as count')
            ->groupBy('player_id')
            ->pluck('count', 'player_id');
            
        $stats = $matchPlayers->map(function($mp) use ($triples) {
            return [
                'id' => $mp->id,
                'player_id' => $mp->player_id,
                'player_name' => $mp->player?->name ?? 'Jugador Desconocido',
                'player_number' => $mp->player?->number ?? 'N/A',
                'team_id' => $mp->team_id,
                'points' => $mp->points,
                'fouls' => $mp->fouls,
                'triples' => $triples[$mp->player_id] ?? 0,
                'is_ejected' => $mp->is_ejected,
            ];
        });

        // Split stats by team for the frontend
        $homeStats = $stats->filter(fn($s) => $s['team_id'] == $match->home_team_id)->values();
        $awayStats = $stats->filter(fn($s) => $s['team_id'] == $match->away_team_id)->values();

        // Collect all players from both teams for the "add player" dropdown
        $allPlayers = collect()
            ->merge(($match->homeTeam?->players ?? collect())->map(fn($p) => ['id' => $p->id, 'name' => $p->name, 'number' => $p->number, 'team_id' => $match->home_team_id]))
            ->merge(($match->awayTeam?->players ?? collect())->map(fn($p) => ['id' => $p->id, 'name' => $p->name, 'number' => $p->number, 'team_id' => $match->away_team_id]))
            ->values();
        
        return response()->json([
            'match' => $match,
            'stats' => $stats,
            'home' => $homeStats,
            'away' => $awayStats,
            'players' => $allPlayers,
            'home_players' => $match->homeTeam?->players ?? [],
            'away_players' => $match->awayTeam?->players ?? [],
        ]);
    }

    public function savePlayerStats(Request $request, Game $match)
    {
        $data = $request->validate([
            'player_id' => 'required|exists:players,id',
            'team_id' => 'nullable|exists:teams,id',
            'points' => 'required|integer|min:0',
            'fouls' => 'required|integer|min:0',
            'triples' => 'required|integer|min:0',
        ]);

        // Auto-resolve team_id if not provided
        if (empty($data['team_id'])) {
            $player = \App\Models\Player::find($data['player_id']);
            $data['team_id'] = $player?->team_id;
            // If still null, try to match from the match itself
            if (empty($data['team_id'])) {
                $data['team_id'] = $match->home_team_id;
            }
        }
        
        $mp = MatchPlayer::updateOrCreate(
            ['match_id' => $match->id, 'player_id' => $data['player_id']],
            [
                'team_id' => $data['team_id'],
                'points' => $data['points'],
                'fouls' => $data['fouls'],
                'is_ejected' => $data['fouls'] >= 5,
            ]
        );
        
        // Sync triples: delete old score3 events for this player and match, then create the new count of score3 events
        MatchEvent::where('match_id', $match->id)
            ->where('player_id', $data['player_id'])
            ->where('type', 'score3')
            ->delete();
            
        for ($i = 0; $i < $data['triples']; $i++) {
            MatchEvent::create([
                'match_id' => $match->id,
                'quarter' => 4,
                'type' => 'score3',
                'team_id' => $data['team_id'],
                'player_id' => $data['player_id'],
                'description' => 'Triple anotado (Estadísticas Individuales)',
            ]);
        }
        
        // Clear public home cache
        \Illuminate\Support\Facades\Cache::forget('public_home_data');
        
        return response()->json([
            'message' => 'Estadísticas del jugador guardadas correctamente.',
            'stat' => [
                'id' => $mp->id,
                'player_id' => $mp->player_id,
                'team_id' => $mp->team_id,
                'points' => $mp->points,
                'fouls' => $mp->fouls,
                'triples' => $data['triples'],
                'is_ejected' => $mp->is_ejected,
            ]
        ]);
    }

    public function deletePlayerStats(Request $request, Game $match, $playerId = null)
    {
        // Support both URL parameter and request body
        $playerId = $playerId ?? $request->input('player_id');
        
        if (!$playerId) {
            return response()->json(['message' => 'player_id es requerido.'], 422);
        }

        MatchPlayer::where('match_id', $match->id)
            ->where('player_id', $playerId)
            ->delete();
            
        MatchEvent::where('match_id', $match->id)
            ->where('player_id', $playerId)
            ->where('type', 'score3')
            ->delete();
            
        // Clear public home cache
        \Illuminate\Support\Facades\Cache::forget('public_home_data');
        
        return response()->json([
            'message' => 'Estadísticas del jugador eliminadas.'
        ]);
    }

    public function destroy(Game $match)
    {
        if ($match->status === 'finished') {
            $this->revertStandings($match);
        }
        $match->delete();

        // Clear public home cache
        \Illuminate\Support\Facades\Cache::forget('public_home_data');

        return response()->json([
            'message' => 'Partido eliminado.'
        ]);
    }

    public function live(Game $match)
    {
        $match->load([
            'homeTeam.players' => fn($q) => $q->orderBy('number'),
            'awayTeam.players' => fn($q) => $q->orderBy('number'),
            'players.player',
            'events',
            'championship',
        ]);

        return response()->json([
            'match' => $match,
        ]);
    }

    /**
     * Batch-save all events accumulated during a quarter.
     * This is the only endpoint called during live play — avoids page reload on every action.
     */
    public function saveBatch(Request $request, Game $match)
    {
        $data = $request->validate([
            'quarter'          => 'required|integer|min:1|max:4',
            'events'           => 'array',
            'events.*.type'    => 'required|in:score,foul',
            'events.*.team'    => 'required|in:home,away',
            'events.*.player_id' => 'nullable|exists:players,id',
            'events.*.value'   => 'required|integer|min:1|max:3',
            'advance_quarter'  => 'boolean',
            'finish'           => 'boolean',
            'forfeit'          => 'boolean',
            'no_show_team_id'  => 'nullable|exists:teams,id',
        ]);

        \DB::transaction(function () use ($data, $match) {
            if (!empty($data['forfeit']) && !empty($data['no_show_team_id'])) {
                $noShowTeamId = $data['no_show_team_id'];
                $isHomeNoShow = ($noShowTeamId == $match->home_team_id);
                
                $match->update([
                    'home_score'      => $isHomeNoShow ? 0 : 20,
                    'away_score'      => $isHomeNoShow ? 20 : 0,
                    'status'          => 'finished',
                    'finished_at'     => now(),
                    'forfeit_team_id' => $noShowTeamId,
                ]);

                $noShowTeamName = Team::find($noShowTeamId)?->name ?? 'Equipo';

                MatchEvent::create([
                    'match_id'             => $match->id,
                    'quarter'              => $match->current_quarter ?: 1,
                    'type'                 => 'match_end',
                    'home_score_snapshot'  => $match->home_score,
                    'away_score_snapshot'  => $match->away_score,
                    'description'          => "Partido finalizado por W.O. No se presentó: {$noShowTeamName}",
                ]);

                $this->updateStandings($match);
                return;
            }

            $homeScore   = 0;
            $awayScore   = 0;
            $homeFouls   = 0;
            $awayFouls   = 0;

            foreach ($data['events'] ?? [] as $event) {
                $isHome  = $event['team'] === 'home';
                $teamId  = $isHome ? $match->home_team_id : $match->away_team_id;

                if ($event['type'] === 'score') {
                    $isHome ? ($homeScore += $event['value']) : ($awayScore += $event['value']);

                    if ($event['player_id']) {
                        MatchPlayer::updateOrCreate(
                            ['match_id' => $match->id, 'player_id' => $event['player_id']],
                            ['team_id'  => $teamId]
                        );
                        MatchPlayer::where('match_id', $match->id)
                            ->where('player_id', $event['player_id'])
                            ->increment('points', $event['value']);
                    }

                    MatchEvent::create([
                        'match_id'             => $match->id,
                        'quarter'              => $data['quarter'],
                        'type'                 => 'score' . $event['value'],
                        'team_id'              => $teamId,
                        'player_id'            => $event['player_id'],
                        'home_score_snapshot'  => $match->home_score + $homeScore,
                        'away_score_snapshot'  => $match->away_score + $awayScore,
                    ]);
                } elseif ($event['type'] === 'foul') {
                    $isHome ? $homeFouls++ : $awayFouls++;

                    if ($event['player_id']) {
                        MatchPlayer::updateOrCreate(
                            ['match_id' => $match->id, 'player_id' => $event['player_id']],
                            ['team_id'  => $teamId]
                        );
                        $mp = MatchPlayer::where('match_id', $match->id)
                            ->where('player_id', $event['player_id']);
                        $mp->increment('fouls');
                        
                        // Eject player from match if total fouls reach 5 or more
                        if ($mp->first()->fouls >= 5) {
                            $mp->update(['is_ejected' => true]);
                        }
                    }

                    $newHomeFouls = ($match->home_fouls_q + $homeFouls);
                    $newAwayFouls = ($match->away_fouls_q + $awayFouls);
                    $foulsForTeam = $isHome ? $newHomeFouls : $newAwayFouls;

                    MatchEvent::create([
                        'match_id'  => $match->id,
                        'quarter'   => $data['quarter'],
                        'type'      => $foulsForTeam >= 5 ? 'foul_bonus' : 'foul',
                        'team_id'   => $teamId,
                        'player_id' => $event['player_id'],
                    ]);
                }
            }

            // Persist accumulated scores and fouls to DB
            $match->increment('home_score', $homeScore);
            $match->increment('away_score', $awayScore);
            $match->increment('home_fouls_q', $homeFouls);
            $match->increment('away_fouls_q', $awayFouls);
            $match->refresh();

            // Advance quarter
            if (!empty($data['advance_quarter']) && $match->current_quarter < 4) {
                $nextQ = $match->current_quarter + 1;
                $match->update([
                    'current_quarter' => $nextQ,
                    'home_fouls_q'    => 0,
                    'away_fouls_q'    => 0,
                ]);
                MatchEvent::create([
                    'match_id'    => $match->id,
                    'quarter'     => $nextQ,
                    'type'        => 'quarter_end',
                    'description' => "Cuarto {$nextQ} iniciado",
                ]);
            }

            // Finish match
            if (!empty($data['finish'])) {
                $match->update([
                    'status'      => 'finished',
                    'finished_at' => now(),
                ]);
                MatchEvent::create([
                    'match_id'             => $match->id,
                    'quarter'              => $match->current_quarter,
                    'type'                 => 'match_end',
                    'home_score_snapshot'  => $match->home_score,
                    'away_score_snapshot'  => $match->away_score,
                    'description'          => 'Partido finalizado',
                ]);
                $this->updateStandings($match);
            }
        });

        return response()->json([
            'message' => !empty($data['finish']) ? 'Partido finalizado.' : 'Cuarto guardado.',
            'match' => $match->fresh(['homeTeam.players', 'awayTeam.players', 'players.player', 'events'])
        ]);
    }

    public function start(Game $match)
    {
        $match->update([
            'status' => 'live',
            'current_quarter' => 1,
            'started_at' => now(),
        ]);

        MatchEvent::create([
            'match_id' => $match->id,
            'quarter' => 1,
            'type' => 'quarter_end',
            'description' => 'Partido iniciado. Cuarto 1 en curso.',
        ]);

        return response()->json([
            'message' => 'Partido iniciado.',
            'match' => $match->fresh(['homeTeam.players', 'awayTeam.players', 'players.player', 'events'])
        ]);
    }

    public function score(Request $request, Game $match)
    {
        $data = $request->validate([
            'team' => 'required|in:home,away',
            'player_id' => 'nullable|exists:players,id',
            'points' => 'required|in:1,2,3',
        ]);

        $field = $data['team'] === 'home' ? 'home_score' : 'away_score';
        $match->increment($field, $data['points']);

        if ($data['player_id']) {
            MatchPlayer::updateOrCreate(
                ['match_id' => $match->id, 'player_id' => $data['player_id']],
                ['team_id' => $data['team'] === 'home' ? $match->home_team_id : $match->away_team_id]
            );
            MatchPlayer::where('match_id', $match->id)
                ->where('player_id', $data['player_id'])
                ->increment('points', $data['points']);
        }

        $match->refresh();
        MatchEvent::create([
            'match_id' => $match->id,
            'quarter' => $match->current_quarter,
            'type' => 'score' . $data['points'],
            'team_id' => $data['team'] === 'home' ? $match->home_team_id : $match->away_team_id,
            'player_id' => $data['player_id'],
            'home_score_snapshot' => $match->home_score,
            'away_score_snapshot' => $match->away_score,
        ]);

        return response()->json([
            'message' => 'Puntos registrados.',
            'match' => $match->fresh(['homeTeam.players', 'awayTeam.players', 'players.player', 'events'])
        ]);
    }

    public function foul(Request $request, Game $match)
    {
        $data = $request->validate([
            'team' => 'required|in:home,away',
            'player_id' => 'nullable|exists:players,id',
        ]);

        $field = $data['team'] === 'home' ? 'home_fouls_q' : 'away_fouls_q';
        $match->increment($field);

        if ($data['player_id']) {
            MatchPlayer::where('match_id', $match->id)
                ->where('player_id', $data['player_id'])
                ->increment('fouls');
        }

        $match->refresh();
        $foulsQ = $data['team'] === 'home' ? $match->home_fouls_q : $match->away_fouls_q;
        $type = $foulsQ >= 5 ? 'foul_bonus' : 'foul';

        MatchEvent::create([
            'match_id' => $match->id,
            'quarter' => $match->current_quarter,
            'type' => $type,
            'team_id' => $data['team'] === 'home' ? $match->home_team_id : $match->away_team_id,
            'player_id' => $data['player_id'],
        ]);

        return response()->json([
            'message' => 'Falta registrada.',
            'match' => $match->fresh(['homeTeam.players', 'awayTeam.players', 'players.player', 'events'])
        ]);
    }

    public function nextQuarter(Game $match)
    {
        if ($match->current_quarter >= 4) {
            return response()->json([
                'message' => 'Error.',
                'errors' => [
                    'quarter' => ['Ya se jugaron todos los cuartos.']
                ]
            ], 422);
        }

        $nextQ = $match->current_quarter + 1;
        $match->update([
            'current_quarter' => $nextQ,
            'home_fouls_q' => 0,
            'away_fouls_q' => 0,
        ]);

        MatchEvent::create([
            'match_id' => $match->id,
            'quarter' => $match->current_quarter,
            'type' => 'quarter_end',
            'description' => "Cuarto {$nextQ} comenzando",
        ]);

        return response()->json([
            'message' => "Cuarto {$nextQ} comenzando",
            'match' => $match->fresh(['homeTeam.players', 'awayTeam.players', 'players.player', 'events'])
        ]);
    }

    public function finish(Game $match)
    {
        $match->update([
            'status' => 'finished',
            'finished_at' => now(),
        ]);

        MatchEvent::create([
            'match_id' => $match->id,
            'quarter' => $match->current_quarter,
            'type' => 'match_end',
            'home_score_snapshot' => $match->home_score,
            'away_score_snapshot' => $match->away_score,
            'description' => 'Partido finalizado',
        ]);

        $this->updateStandings($match);

        return response()->json([
            'message' => 'Partido finalizado.',
            'match' => $match->fresh(['homeTeam.players', 'awayTeam.players', 'players.player', 'events'])
        ]);
    }

    public function importResults(Request $request, Game $match)
    {
        $data = $request->validate([
            'home_score' => 'required|integer|min:0',
            'away_score' => 'required|integer|min:0',
            'players' => 'array',
            'players.*.player_id' => 'required|exists:players,id',
            'players.*.team_id' => 'required|exists:teams,id',
            'players.*.points' => 'required|integer|min:0',
            'players.*.fouls' => 'required|integer|min:0',
        ]);

        \DB::transaction(function () use ($data, $match) {
            // 1. Revert standings if the match was already finished
            if ($match->status === 'finished') {
                $this->revertStandings($match);
            }

            // 2. Clear old match players and events
            MatchPlayer::where('match_id', $match->id)->delete();
            MatchEvent::where('match_id', $match->id)->delete();

            // 3. Create new match players
            foreach ($data['players'] ?? [] as $playerData) {
                MatchPlayer::create([
                    'match_id' => $match->id,
                    'player_id' => $playerData['player_id'],
                    'team_id' => $playerData['team_id'],
                    'points' => $playerData['points'],
                    'fouls' => $playerData['fouls'],
                    'is_ejected' => $playerData['fouls'] >= 5,
                ]);
            }

            // 4. Update the match scores and status
            $match->update([
                'home_score' => $data['home_score'],
                'away_score' => $data['away_score'],
                'status' => 'finished',
                'finished_at' => now(),
                'current_quarter' => 4,
            ]);

            // 5. Create a match end event
            MatchEvent::create([
                'match_id' => $match->id,
                'quarter' => 4,
                'type' => 'match_end',
                'home_score_snapshot' => $data['home_score'],
                'away_score_snapshot' => $data['away_score'],
                'description' => 'Partido finalizado e importado por acta de resultados.',
            ]);

            // 6. Update standings with the new scores
            $this->updateStandings($match);
        });

        return response()->json([
            'message' => 'Acta de resultados importada correctamente.',
            'match' => $match->fresh(['homeTeam.players', 'awayTeam.players', 'players.player', 'events'])
        ]);
    }

    private function revertStandings(Game $match): void
    {
        if ($match->stage !== 'group') {
            return;
        }

        $isForfeit = !is_null($match->forfeit_team_id);
        $homeWon = $match->home_score > $match->away_score;
        $diff = $match->home_score - $match->away_score;

        $match->championship->standings()
            ->where('team_id', $match->home_team_id)
            ->decrement('pj');
        $match->championship->standings()
            ->where('team_id', $match->away_team_id)
            ->decrement('pj');

        if ($isForfeit) {
            if ($match->forfeit_team_id == $match->home_team_id) {
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->decrement('pg');
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->decrement('pts', 2);
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->decrement('pp');
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->decrement('pts', 0);
            } else {
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->decrement('pg');
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->decrement('pts', 2);
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->decrement('pp');
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->decrement('pts', 0);
            }
        } else {
            if ($homeWon) {
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->decrement('pg');
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->decrement('pts', 2);
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->decrement('pp');
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->decrement('pts', 1);
            } else {
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->decrement('pg');
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->decrement('pts', 2);
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->decrement('pp');
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->decrement('pts', 1);
            }
        }

        $match->championship->standings()->where('team_id', $match->home_team_id)
            ->decrement('dif', $diff);
        $match->championship->standings()->where('team_id', $match->away_team_id)
            ->decrement('dif', -$diff);
    }

    private function updateStandings(Game $match): void
    {
        if ($match->stage !== 'group') {
            return;
        }

        $isForfeit = !is_null($match->forfeit_team_id);
        $homeWon = $match->home_score > $match->away_score;
        $diff = $match->home_score - $match->away_score;

        $match->championship->standings()
            ->where('team_id', $match->home_team_id)
            ->increment('pj');
        $match->championship->standings()
            ->where('team_id', $match->away_team_id)
            ->increment('pj');

        if ($isForfeit) {
            if ($match->forfeit_team_id == $match->home_team_id) {
                // Home forfeited. Away wins with 2 pts, Home loses with 0 pts.
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->increment('pg');
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->increment('pts', 2);
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->increment('pp');
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->increment('pts', 0);
            } else {
                // Away forfeited. Home wins with 2 pts, Away loses with 0 pts.
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->increment('pg');
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->increment('pts', 2);
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->increment('pp');
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->increment('pts', 0);
            }
        } else {
            if ($homeWon) {
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->increment('pg');
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->increment('pts', 2);
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->increment('pp');
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->increment('pts', 1);
            } else {
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->increment('pg');
                $match->championship->standings()->where('team_id', $match->away_team_id)
                    ->increment('pts', 2);
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->increment('pp');
                $match->championship->standings()->where('team_id', $match->home_team_id)
                    ->increment('pts', 1);
            }
        }

        $match->championship->standings()->where('team_id', $match->home_team_id)
            ->increment('dif', $diff);
        $match->championship->standings()->where('team_id', $match->away_team_id)
            ->increment('dif', -$diff);
    }
}
