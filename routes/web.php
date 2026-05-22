<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\RefereeController;
use App\Http\Controllers\Admin\ChampionshipController;
use App\Http\Controllers\Admin\MatchController;
use Illuminate\Support\Facades\Route;

// ─── Público ────────────────────────────────────────────────────────────────
Route::get('/', [PublicController::class, 'home'])->name('home');

// ─── Auth ───────────────────────────────────────────────────────────────────
Route::get('/login', [AuthController::class, 'showLogin'])->name('login')->middleware('guest');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// ─── Admin (requiere auth + rol directiva o admin) ──────────────────────────
Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin,directiva'])->group(function () {

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Equipos
    Route::get('/equipos', [TeamController::class, 'index'])->name('teams');
    Route::post('/equipos', [TeamController::class, 'store']);
    Route::put('/equipos/{team}', [TeamController::class, 'update']);
    Route::delete('/equipos/{team}', [TeamController::class, 'destroy']);
    Route::post('/equipos/{team}/jugadores', [TeamController::class, 'storePlayer']);
    Route::put('/equipos/{team}/jugadores/{player}', [TeamController::class, 'updatePlayer']);
    Route::delete('/equipos/{team}/jugadores/{player}', [TeamController::class, 'destroyPlayer']);

    // Árbitros
    Route::get('/arbitros', [RefereeController::class, 'index'])->name('referees');
    Route::post('/arbitros', [RefereeController::class, 'store']);
    Route::put('/arbitros/{referee}', [RefereeController::class, 'update']);
    Route::delete('/arbitros/{referee}', [RefereeController::class, 'destroy']);

    // Campeonatos
    Route::get('/campeonatos', [ChampionshipController::class, 'index'])->name('championships');
    Route::post('/campeonatos', [ChampionshipController::class, 'store']);
    Route::put('/campeonatos/{championship}', [ChampionshipController::class, 'update']);
    Route::delete('/campeonatos/{championship}', [ChampionshipController::class, 'destroy']);

    // Partidos
    Route::get('/partidos', [MatchController::class, 'index'])->name('matches');
    Route::post('/partidos', [MatchController::class, 'store']);
    Route::put('/partidos/{match}', [MatchController::class, 'update']);
    Route::delete('/partidos/{match}', [MatchController::class, 'destroy']);

    // Partido en vivo
    Route::get('/partidos/{match}/live', [MatchController::class, 'live'])->name('match.live');
    Route::post('/partidos/{match}/start', [MatchController::class, 'start'])->name('match.start');
    Route::post('/partidos/{match}/score', [MatchController::class, 'score'])->name('match.score');
    Route::post('/partidos/{match}/foul', [MatchController::class, 'foul'])->name('match.foul');
    Route::post('/partidos/{match}/next-quarter', [MatchController::class, 'nextQuarter'])->name('match.next-quarter');
    Route::post('/partidos/{match}/finish', [MatchController::class, 'finish'])->name('match.finish');
});
