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
                'matches.homeTeam',
                'matches.awayTeam',
                'matches.events.player',
            ])
            ->first();

        $liveMatches = Game::where('status', 'live')
            ->with(['homeTeam', 'awayTeam', 'championship', 'events.player'])
            ->get();

        $recentMatches = Game::where('status', 'finished')
            ->with(['homeTeam', 'awayTeam'])
            ->latest('finished_at')
            ->take(5)
            ->get();

        $teams = Team::where('active', true)->get();

        return Inertia::render('Public/Home', [
            'championship' => $activeChampionship,
            'liveMatches' => $liveMatches,
            'recentMatches' => $recentMatches,
            'teams' => $teams,
        ]);
    }
}
