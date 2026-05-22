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
use Inertia\Inertia;

class MatchController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Matches', [
            'matches' => Game::with(['homeTeam', 'awayTeam', 'championship', 'referee'])
                ->orderBy('scheduled_at')
                ->get(),
            'championships' => Championship::where('status', '!=', 'finished')->get(),
            'teams' => Team::where('active', true)->orderBy('name')->get(),
            'referees' => Referee::where('status', 'activo')->orderBy('name')->get(),
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
        ]);

        Game::create($data);

        return back()->with('success', 'Partido creado.');
    }

    public function update(Request $request, Game $match)
    {
        $data = $request->validate([
            'court' => 'nullable|string|max:150',
            'scheduled_at' => 'nullable|date',
            'referee_id' => 'nullable|exists:referees,id',
            'ref1_id' => 'nullable|exists:referees,id',
            'ref2_id' => 'nullable|exists:referees,id',
        ]);

        $match->update($data);

        return back()->with('success', 'Partido actualizado.');
    }

    public function destroy(Game $match)
    {
        $match->delete();
        return back()->with('success', 'Partido eliminado.');
    }

    public function live(Game $match)
    {
        $match->load([
            'homeTeam.players',
            'awayTeam.players',
            'players.player',
            'events',
            'championship',
        ]);

        return Inertia::render('Admin/MatchLive', [
            'match' => $match,
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
            'description' => 'Partido iniciado - Cuarto 1',
        ]);

        return back();
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

        return back();
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

        return back();
    }

    public function nextQuarter(Game $match)
    {
        if ($match->current_quarter >= 4) {
            return back()->withErrors(['quarter' => 'Ya se jugaron todos los cuartos.']);
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
            'description' => "Cuarto {$nextQ} iniciado",
        ]);

        return back();
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

        return redirect()->route('admin.matches');
    }

    private function updateStandings(Game $match): void
    {
        if ($match->stage !== 'group') {
            return;
        }
        $homeWon = $match->home_score > $match->away_score;
        $diff = $match->home_score - $match->away_score;

        $match->championship->standings()
            ->where('team_id', $match->home_team_id)
            ->increment('pj');
        $match->championship->standings()
            ->where('team_id', $match->away_team_id)
            ->increment('pj');

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

        $match->championship->standings()->where('team_id', $match->home_team_id)
            ->increment('dif', $diff);
        $match->championship->standings()->where('team_id', $match->away_team_id)
            ->increment('dif', -$diff);
    }
}
