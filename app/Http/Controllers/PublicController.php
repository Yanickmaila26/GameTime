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
        $data = Cache::remember('public_home_data', 86400, function () {
            $activeChampionship = Championship::where('status', 'active')
                ->with([
                    'teams' => function ($q) {
                        $q->orderByPivot('pts', 'desc');
                    },
                    'teams:id,name,short_name,logo_color,logo_url',
                    'teams.players:id,team_id,name,number,position,status',
                    'teams.players.matchStats:id,player_id,points',
                    'matches' => function ($q) {
                        $q->orderBy('scheduled_at');
                    },
                    'matches.homeTeam:id,name,short_name,logo_color,logo_url',
                    'matches.awayTeam:id,name,short_name,logo_color,logo_url',
                    'matches.referee:id,name',
                    'matches.players:id,match_id,player_id,points,fouls,is_ejected',
                    'matches.events:id,match_id,quarter,type,team_id,player_id,home_score_snapshot,away_score_snapshot,description',
                    'matches.events.player:id,name',
                ])
                ->first();

            $liveMatches = Game::where('status', 'live')
                ->with([
                    'homeTeam:id,name,short_name,logo_color,logo_url',
                    'homeTeam.players:id,team_id,name,number,position,status',
                    'awayTeam:id,name,short_name,logo_color,logo_url',
                    'awayTeam.players:id,team_id,name,number,position,status',
                    'championship:id,name,status',
                    'players:id,match_id,player_id,points,fouls,is_ejected',
                    'events:id,match_id,quarter,type,team_id,player_id,home_score_snapshot,away_score_snapshot,description',
                    'events.player:id,name'
                ])
                ->get();

            $recentMatches = Game::where('status', 'finished')
                ->with([
                    'homeTeam:id,name,short_name,logo_color,logo_url',
                    'homeTeam.players:id,team_id,name,number,position,status',
                    'awayTeam:id,name,short_name,logo_color,logo_url',
                    'awayTeam.players:id,team_id,name,number,position,status',
                    'players:id,match_id,player_id,points,fouls,is_ejected',
                    'events:id,match_id,quarter,type,team_id,player_id,home_score_snapshot,away_score_snapshot,description',
                    'events.player:id,name'
                ])
                ->latest('finished_at')
                ->take(5)
                ->get();

            $teams = Team::where('active', true)
                ->select('id', 'name', 'short_name', 'logo_color', 'logo_url')
                ->get();

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
                ->filter(fn($me) => !is_null($me->player));

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

            $generalMedia = \App\Models\Multimedia::whereNull('team_id')->latest()->take(6)->get();

            return [
                'championship' => $activeChampionship,
                'liveMatches' => $liveMatches,
                'recentMatches' => $recentMatches,
                'teams' => $teams,
                'generalMedia' => $generalMedia,
                'leaders' => [
                    'scorers' => $scorers,
                    'threepointers' => $threepointers,
                    'foulers' => $fouls,
                ]
            ];
        });

        return response()->json($data);
    }
}
