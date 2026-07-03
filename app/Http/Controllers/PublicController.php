<?php

namespace App\Http\Controllers;

use App\Models\Championship;
use App\Models\Game;
use App\Models\Team;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function home()
    {
        // Cache only lightweight data (no Base64 images). TTL: 5 minutes.
        $data = Cache::remember('public_home_data', 300, function () {
            $activeChampionship = Championship::where('status', 'active')
                ->with([
                    'teams' => function ($q) {
                        // Exclude logo_url (Base64) to keep response small
                        $q->orderByPivot('pts', 'desc')
                          ->select('teams.id', 'teams.name', 'teams.short_name', 'teams.logo_color');
                    },
                    'teams.players:id,team_id,name,number,position,status',
                    'teams.players.matchStats:id,player_id,points',
                    'matches' => function ($q) {
                        $q->orderBy('scheduled_at');
                    },
                    'matches.homeTeam:id,name,short_name,logo_color',
                    'matches.awayTeam:id,name,short_name,logo_color',
                    'matches.referee:id,name',
                    'matches.players:id,match_id,player_id,points,fouls,is_ejected',
                    'matches.events:id,match_id,quarter,type,team_id,player_id,home_score_snapshot,away_score_snapshot,description',
                    'matches.events.player:id,name',
                ])
                ->first();

            $liveMatches = Game::where('status', 'live')
                ->with([
                    'homeTeam:id,name,short_name,logo_color',
                    'homeTeam.players:id,team_id,name,number,position,status',
                    'awayTeam:id,name,short_name,logo_color',
                    'awayTeam.players:id,team_id,name,number,position,status',
                    'championship:id,name,status',
                    'players:id,match_id,player_id,points,fouls,is_ejected',
                    'events:id,match_id,quarter,type,team_id,player_id,home_score_snapshot,away_score_snapshot,description',
                    'events.player:id,name'
                ])
                ->get();

            $recentMatches = Game::where('status', 'finished')
                ->with([
                    'homeTeam:id,name,short_name,logo_color',
                    'homeTeam.players:id,team_id,name,number,position,status',
                    'awayTeam:id,name,short_name,logo_color',
                    'awayTeam.players:id,team_id,name,number,position,status',
                    'players:id,match_id,player_id,points,fouls,is_ejected',
                    'events:id,match_id,quarter,type,team_id,player_id,home_score_snapshot,away_score_snapshot,description',
                    'events.player:id,name'
                ])
                ->latest('finished_at')
        $activeChampionship = Championship::where('status', 'active')
            ->with([
                'teams' => function ($q) {
                    // Exclude logo_url (Base64) to keep response small
                    $q->orderByPivot('pts', 'desc')
                      ->select('teams.id', 'teams.name', 'teams.short_name', 'teams.logo_color');
                },
                'teams.players:id,team_id,name,number,position,status',
                'teams.players.matchStats:id,player_id,points',
                'matches' => function ($q) {
                    $q->orderBy('scheduled_at');
                },
                'matches.homeTeam:id,name,short_name,logo_color',
                'matches.awayTeam:id,name,short_name,logo_color',
            ])
            ->first();

        $liveMatches = [];
        $recentMatches = [];
        $teams = [];

        if ($activeChampionship) {
            $liveMatches = $activeChampionship->matches
                ->filter(fn($m) => $m->status === 'live')
                ->values();

            $recentMatches = $activeChampionship->matches
                ->filter(fn($m) => $m->status === 'finished')
                ->take(5)
                ->values();

            $teams = $activeChampionship->teams;
        }

        // 1. Scorers (Sum of points in match_players)
        $scorers = \App\Models\MatchPlayer::has('player')
            ->selectRaw('player_id, SUM(points) as total_points, COUNT(match_id) as games_played, AVG(points) as ppg')
            ->groupBy('player_id')
            ->orderByDesc('total_points')
            ->with(['player.team'])
            ->take(3)
            ->get()
            ->map(function ($mp) {
                return [
                    'id'       => $mp->player_id,
                    'name'     => $mp->player->name,
                    'team'     => $mp->player->team?->name ?? 'Equipo',
                    'ppg'      => round($mp->ppg, 1),
                    'total'    => $mp->total_points,
                    'matches'  => $mp->games_played,
                    'avatar'   => collect(explode(' ', $mp->player->name))->map(fn($n) => mb_substr($n, 0, 1))->join(''),
                    'position' => $mp->player->position ?? 'Jugador',
                ];
            })
            ->values();

        // 2. Threepointers (Count of score3 in match_events)
        $threepointers = \App\Models\MatchEvent::where('type', 'score3')
            ->has('player')
            ->selectRaw('player_id, COUNT(id) as total_triples')
            ->groupBy('player_id')
            ->orderByDesc('total_triples')
            ->with(['player.team'])
            ->take(3)
            ->get();

        $threepointerPlayerIds = $threepointers->pluck('player_id')->toArray();
        $gamesPlayedCounts = \App\Models\MatchPlayer::whereIn('player_id', $threepointerPlayerIds)
            ->selectRaw('player_id, COUNT(match_id) as count')
            ->groupBy('player_id')
            ->pluck('count', 'player_id');

        $threepointers = $threepointers->map(function ($me) use ($gamesPlayedCounts) {
            $gamesPlayed = $gamesPlayedCounts[$me->player_id] ?? 1;
            return [
                'id'       => $me->player_id,
                'name'     => $me->player->name,
                'team'     => $me->player->team?->name ?? 'Equipo',
                'tpg'      => round($me->total_triples / $gamesPlayed, 1),
                'total'    => $me->total_triples,
                'avatar'   => collect(explode(' ', $me->player->name))->map(fn($n) => mb_substr($n, 0, 1))->join(''),
                'position' => $me->player->position ?? 'Jugador',
            ];
        })
        ->values();

        // 3. Baskets (Count of score2 in match_events = field goals / aros)
        $baskets = \App\Models\MatchEvent::where('type', 'score2')
            ->has('player')
            ->selectRaw('player_id, COUNT(id) as total_baskets')
            ->groupBy('player_id')
            ->orderByDesc('total_baskets')
            ->with(['player.team'])
            ->take(3)
            ->get();

        $basketPlayerIds = $baskets->pluck('player_id')->toArray();
        $gamesPlayedBaskets = \App\Models\MatchPlayer::whereIn('player_id', $basketPlayerIds)
            ->selectRaw('player_id, COUNT(match_id) as count')
            ->groupBy('player_id')
            ->pluck('count', 'player_id');

        $baskets = $baskets->map(function ($me) use ($gamesPlayedBaskets) {
            $gamesPlayed = $gamesPlayedBaskets[$me->player_id] ?? 1;
            return [
                'id'       => $me->player_id,
                'name'     => $me->player->name,
                'team'     => $me->player->team?->name ?? 'Equipo',
                'bpg'      => round($me->total_baskets / $gamesPlayed, 1),
                'total'    => $me->total_baskets,
                'avatar'   => collect(explode(' ', $me->player->name))->map(fn($n) => mb_substr($n, 0, 1))->join(''),
                'position' => $me->player->position ?? 'Jugador',
            ];
        })
        ->values();

        // 4. Fouls (Sum of fouls in match_players)
        $fouls = \App\Models\MatchPlayer::has('player')
            ->selectRaw('player_id, SUM(fouls) as total_fouls, COUNT(match_id) as games_played, AVG(fouls) as fpg')
            ->groupBy('player_id')
            ->orderByDesc('total_fouls')
            ->with(['player.team'])
            ->take(3)
            ->get()
            ->map(function ($mp) {
                return [
                    'id'       => $mp->player_id,
                    'name'     => $mp->player->name,
                    'team'     => $mp->player->team?->name ?? 'Equipo',
                    'fpg'      => round($mp->fpg, 1),
                    'total'    => $mp->total_fouls,
                    'avatar'   => collect(explode(' ', $mp->player->name))->map(fn($n) => mb_substr($n, 0, 1))->join(''),
                    'position' => $mp->player->position ?? 'Jugador',
                ];
            })
            ->values();

        $customFilePath = storage_path('app/custom_leaders.json');
        if (file_exists($customFilePath)) {
            $customLeaders = json_decode(file_get_contents($customFilePath), true);
            if ($customLeaders && is_array($customLeaders)) {
                if (!empty($customLeaders['scorers'])) $scorers = collect($customLeaders['scorers']);
                if (!empty($customLeaders['threepointers'])) $threepointers = collect($customLeaders['threepointers']);
                if (!empty($customLeaders['baskets'])) $baskets = collect($customLeaders['baskets']);
                if (!empty($customLeaders['foulers'])) $fouls = collect($customLeaders['foulers']);
            }
        } else {
            // Default fallback if no database leaders exist yet
            if ($scorers->isEmpty()) {
                $scorers = collect([
                    ['id' => 1, 'name' => 'Mateo Flores', 'team' => 'Fenix BC', 'position' => 'BASE', 'avatar' => 'MF', 'total' => 126],
                    ['id' => 2, 'name' => 'Cristian Jimenez', 'team' => 'DM Basketball', 'position' => 'BASE', 'avatar' => 'CJ', 'total' => 105],
                    ['id' => 3, 'name' => 'Alex Zapata', 'team' => 'Team Salcedo', 'position' => 'BASE', 'avatar' => 'AZ', 'total' => 101],
                ]);
            }
            if ($threepointers->isEmpty()) {
                $threepointers = collect([
                    ['id' => 1, 'name' => 'Joel Villagómez', 'team' => 'Fenix BC', 'position' => 'BASE', 'avatar' => 'JV', 'total' => 7],
                    ['id' => 2, 'name' => 'Basantes Mateo', 'team' => 'Golden Kings', 'position' => 'BASE', 'avatar' => 'BM', 'total' => 7],
                    ['id' => 3, 'name' => 'Ortega Francisco', 'team' => 'Ambato City', 'position' => 'BASE', 'avatar' => 'OF', 'total' => 5],
                ]);
            }
            if ($baskets->isEmpty()) {
                $baskets = collect([
                    ['id' => 1, 'name' => 'Fernandez Neomar', 'team' => 'Team TNT', 'position' => 'BASE', 'avatar' => 'FN', 'total' => 21],
                    ['id' => 2, 'name' => 'Alex Zapata', 'team' => 'Team Salcedo', 'position' => 'BASE', 'avatar' => 'AZ', 'total' => 19],
                    ['id' => 3, 'name' => 'Diesel Suarez', 'team' => 'Team TNT', 'position' => 'BASE', 'avatar' => 'DS', 'total' => 18],
                ]);
            }
            if ($fouls->isEmpty()) {
                $fouls = collect([
                    ['id' => 1, 'name' => 'Echeverria Mateo', 'team' => 'NPI', 'position' => 'BASE', 'avatar' => 'EM', 'total' => 21],
                    ['id' => 2, 'name' => 'Laverde Samuel', 'team' => 'NPI', 'position' => 'BASE', 'avatar' => 'LS', 'total' => 20],
                    ['id' => 3, 'name' => 'Ricardo Ortiz', 'team' => 'Cotopaxi Elite', 'position' => 'BASE', 'avatar' => 'RO', 'total' => 18],
                ]);
            }
        }

        // Always sort descending by total so the highest value is #1 Líder
        $scorers = $scorers->sortByDesc(fn($item) => (int)($item['total'] ?? 0))->values();
        $threepointers = $threepointers->sortByDesc(fn($item) => (int)($item['total'] ?? 0))->values();
        $baskets = $baskets->sortByDesc(fn($item) => (int)($item['total'] ?? 0))->values();
        $fouls = $fouls->sortByDesc(fn($item) => (int)($item['total'] ?? 0))->values();

        $data = [
            'championship' => $activeChampionship,
            'liveMatches' => $liveMatches,
            'recentMatches' => $recentMatches,
            'teams' => $teams,
            'leaders' => [
                'scorers' => $scorers,
                'threepointers' => $threepointers,
                'baskets' => $baskets,
                'foulers' => $fouls,
            ]
        ];

        // Fetch media OUTSIDE the cache to avoid storing Base64 blobs in DB cache.
        // Returns only id, title, team_id, type — NOT file_path (too large).
        $generalMedia = \App\Models\Multimedia::whereNull('team_id')
            ->latest()
            ->take(6)
            ->get(['id', 'title', 'team_id', 'type', 'created_at']);

        $data = array_merge((array) $data, ['generalMedia' => $generalMedia]);

        return response()->json($data);
    }

    /**
     * Serve a single team's logo (Base64).
     * Called by the frontend as /api/teams/{id}/logo
     */
    public function teamLogo(int $id)
    {
        $team = \App\Models\Team::select('id', 'logo_url', 'logo_color', 'short_name')
            ->findOrFail($id);

        return response()->json([
            'id'        => $team->id,
            'logo_url'  => $team->logo_url,
            'logo_color'=> $team->logo_color,
            'short_name'=> $team->short_name,
        ]);
    }

    /**
     * Serve a single multimedia file by ID.
     * Called by the frontend as /api/media/{id}
     */
    public function mediaFile(int $id)
    {
        $media = \App\Models\Multimedia::select('id', 'file_path', 'title', 'type', 'team_id')
            ->findOrFail($id);

        return response()->json($media);
    }
}
