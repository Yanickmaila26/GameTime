<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Game;
use App\Models\Team;
use App\Models\Player;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // ── Panel Directiva ─────────────────────────────────────────────────────
        if ($user->role === 'directiva') {
            $championship = Championship::with([
                'teams' => fn($q) => $q->orderByPivot('pts', 'desc'),
                'matches.homeTeam',
                'matches.awayTeam',
            ])->latest()->first();

            return response()->json([
                'role' => 'directiva',
                'championship' => $championship,
            ]);
        }

        // ── Panel Admin ─────────────────────────────────────────────────────────
        return response()->json([
            'role' => 'admin',
            'stats' => [
                'teams'         => Team::where('active', true)->count(),
                'players'       => Player::count(),
                'championships' => Championship::count(),
                'liveMatches'   => Game::where('status', 'live')->count(),
            ],
            'liveMatches' => Game::where('status', 'live')
                ->with(['homeTeam', 'awayTeam', 'championship'])
                ->get(),
            'upcomingMatches' => Game::where('status', 'scheduled')
                ->with(['homeTeam', 'awayTeam'])
                ->orderBy('scheduled_at')
                ->take(5)
                ->get(),
        ]);
    }
}
