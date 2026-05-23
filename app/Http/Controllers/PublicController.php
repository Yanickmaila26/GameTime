<?php

namespace App\Http\Controllers;

use App\Models\Championship;
use App\Models\Game;
use App\Models\Team;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function home()
    {
        $activeChampionship = Championship::where('status', 'active')
            ->with([
                'teams' => function ($q) {
                    $q->orderByPivot('pts', 'desc');
                },
                'matches.homeTeam.players',
                'matches.awayTeam.players',
                'matches.players.player',
                'matches.events.player',
            ])
            ->first();

        $liveMatches = Game::where('status', 'live')
            ->with([
                'homeTeam.players',
                'awayTeam.players',
                'championship',
                'players.player',
                'events.player'
            ])
            ->get();

        $recentMatches = Game::where('status', 'finished')
            ->with([
                'homeTeam.players',
                'awayTeam.players',
                'players.player',
                'events.player'
            ])
            ->latest('finished_at')
            ->take(5)
            ->get();

        $teams = Team::where('active', true)->get();

        // 1. Scorers (Sum of points in match_players)
        $scorers = \App\Models\MatchPlayer::selectRaw('player_id, SUM(points) as total_points, COUNT(match_id) as games_played, AVG(points) as ppg')
            ->groupBy('player_id')
            ->orderByDesc('total_points')
            ->with(['player.team'])
            ->take(3)
            ->get()
            ->filter(fn($mp) => !is_null($mp->player))
            ->map(function ($mp) {
                return [
                    'id'       => $mp->player_id,
                    'name'     => $mp->player->name,
                    'team'     => $mp->player->team?->name ?? 'Equipo',
                    'ppg'      => round($mp->ppg, 1),
                    'matches'  => $mp->games_played,
                    'avatar'   => collect(explode(' ', $mp->player->name))->map(fn($n) => mb_substr($n, 0, 1))->join(''),
                    'position' => $mp->player->position ?? 'Jugador',
                ];
            })
            ->values();

        // 2. Threepointers (Count of score3 in match_events)
        $threepointers = \App\Models\MatchEvent::where('type', 'score3')
            ->selectRaw('player_id, COUNT(id) as total_triples')
            ->groupBy('player_id')
            ->orderByDesc('total_triples')
            ->with(['player.team'])
            ->take(3)
            ->get()
            ->filter(fn($me) => !is_null($me->player))
            ->map(function ($me) {
                $gamesPlayed = \App\Models\MatchPlayer::where('player_id', $me->player_id)->count() ?: 1;
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

        // 3. Fouls (Sum of fouls in match_players)
        $fouls = \App\Models\MatchPlayer::selectRaw('player_id, SUM(fouls) as total_fouls, COUNT(match_id) as games_played, AVG(fouls) as fpg')
            ->groupBy('player_id')
            ->orderByDesc('total_fouls')
            ->with(['player.team'])
            ->take(3)
            ->get()
            ->filter(fn($mp) => !is_null($mp->player))
            ->map(function ($mp) {
                return [
                    'id'       => $mp->player_id,
                    'name'     => $mp->player->name,
                    'team'     => $mp->player->team?->name ?? 'Equipo',
                    'rpg'      => round($mp->fpg, 1),
                    'total'    => $mp->total_fouls,
                    'avatar'   => collect(explode(' ', $mp->player->name))->map(fn($n) => mb_substr($n, 0, 1))->join(''),
                    'position' => $mp->player->position ?? 'Jugador',
                ];
            })
            ->values();

        return Inertia::render('Public/Home', [
            'championship' => $activeChampionship,
            'liveMatches' => $liveMatches,
            'recentMatches' => $recentMatches,
            'teams' => $teams,
            'leaders' => [
                'scorers' => $scorers,
                'threepointers' => $threepointers,
                'rebounders' => $fouls,
            ]
        ]);
    }
}
