<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\RefereeController;
use App\Http\Controllers\Admin\ChampionshipController;
use App\Http\Controllers\Admin\MatchController;
use App\Http\Controllers\Admin\MultimediaController;

// ─── Debug routes ────────────────────────────────────────────────────────────
Route::get('/debug-routes', function () {
    return response()->json([
        'has_importar_acta' => collect(Route::getRoutes())->contains(function ($route) {
            return str_contains($route->uri(), 'importar-acta');
        }),
        'routes' => collect(Route::getRoutes())->map(function ($route) {
            return [
                'uri' => $route->uri(),
                'methods' => $route->methods(),
            ];
        })
    ]);
});

// ─── Migraciones y Seeds desde el Navegador ──────────────────────────────────
Route::get('/run-migrations', function () {
    try {
        Artisan::call('migrate', ['--force' => true]);
        $output = Artisan::output();
        
        Artisan::call('db:seed', ['--force' => true]);
        $output .= "\n" . Artisan::output();
        
        return response()->json([
            'status' => 'success',
            'output' => $output
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::get('/test-index', function () {
    try {
        $championships = \App\Models\Championship::with(['teams', 'creator', 'matches.homeTeam', 'matches.awayTeam'])->latest()->get();
        $teams = \App\Models\Team::where('active', true)->orderBy('name')->get();
        return response()->json([
            'status' => 'success',
            'count_championships' => $championships->count(),
            'count_teams' => $teams->count(),
            'championships' => $championships,
            'teams' => $teams
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});

Route::get('/view-logs', function () {
    try {
        $logPath = storage_path('logs/laravel.log');
        if (!file_exists($logPath)) {
            return response()->json(['status' => 'error', 'message' => 'No log file found.']);
        }
        $content = file_get_contents($logPath);
        return response(substr($content, -30000))
            ->header('Content-Type', 'text/plain');
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

// ─── Público ────────────────────────────────────────────────────────────────
Route::get('/clear-cache', function () {
    \Illuminate\Support\Facades\Cache::forget('public_home_data');
    return response()->json(['message' => 'Cache cleared']);
});
Route::get('/home', [PublicController::class, 'home']);
Route::get('/teams/{id}/logo', [PublicController::class, 'teamLogo']);  // Serves team logo (Base64) on demand
Route::get('/media/{id}', [PublicController::class, 'mediaFile']);       // Serves individual media file on demand
Route::get('/teams/{team}/media', function (\App\Models\Team $team) {
    return response()->json($team->media()->latest()->get());
});

// ─── Auth ───────────────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ─── Rutas Protegidas por Sanctum ──────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function () {
        return response()->json(auth()->user());
    });

    // Panel Admin (requiere rol directiva o admin)
    Route::prefix('admin')->middleware('role:admin,directiva')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Equipos
        Route::get('/equipos', [TeamController::class, 'index']);
        Route::post('/equipos', [TeamController::class, 'store']);
        Route::put('/equipos/{team}', [TeamController::class, 'update']);
        Route::delete('/equipos/{team}', [TeamController::class, 'destroy']);
        Route::post('/equipos/{team}/jugadores', [TeamController::class, 'storePlayer']);
        Route::put('/equipos/{team}/jugadores/{player}', [TeamController::class, 'updatePlayer']);
        Route::delete('/equipos/{team}/jugadores/{player}', [TeamController::class, 'destroyPlayer']);

        // Árbitros
        Route::get('/arbitros', [RefereeController::class, 'index']);
        Route::post('/arbitros', [RefereeController::class, 'store']);
        Route::put('/arbitros/{referee}', [RefereeController::class, 'update']);
        Route::delete('/arbitros/{referee}', [RefereeController::class, 'destroy']);

        // Partidos
        Route::get('/partidos', [MatchController::class, 'index']);
        Route::post('/partidos', [MatchController::class, 'store']);
        Route::put('/partidos/{match}', [MatchController::class, 'update']);
        Route::delete('/partidos/{match}', [MatchController::class, 'destroy']);
        Route::get('/partidos/{match}/estadisticas', [MatchController::class, 'getStats']);
        Route::post('/partidos/{match}/estadisticas', [MatchController::class, 'savePlayerStats']);
        Route::delete('/partidos/{match}/estadisticas/{playerId}', [MatchController::class, 'deletePlayerStats']);
        Route::delete('/partidos/{match}/estadisticas', [MatchController::class, 'deletePlayerStats']);

        // Partido en vivo
        Route::get('/partidos/{match}/live', [MatchController::class, 'live']);
        Route::post('/partidos/{match}/start', [MatchController::class, 'start']);
        Route::post('/partidos/{match}/guardar-cuarto', [MatchController::class, 'saveBatch']);
        Route::post('/partidos/{match}/score', [MatchController::class, 'score']);
        Route::post('/partidos/{match}/foul', [MatchController::class, 'foul']);
        Route::post('/partidos/{match}/next-quarter', [MatchController::class, 'nextQuarter']);
        Route::post('/partidos/{match}/finish', [MatchController::class, 'finish']);
        Route::post('/partidos/{match}/importar-acta', [MatchController::class, 'importResults']);

        // Multimedia
        Route::get('/multimedia', [MultimediaController::class, 'index']);
        Route::post('/multimedia', [MultimediaController::class, 'store']);
        Route::delete('/multimedia/{media}', [MultimediaController::class, 'destroy']);

        // Rutas solo para admin (no directiva)
        Route::middleware('role:admin')->group(function () {
            Route::get('/campeonatos', [ChampionshipController::class, 'index']);
            Route::post('/campeonatos', [ChampionshipController::class, 'store']);
            Route::put('/campeonatos/{championship}', [ChampionshipController::class, 'update']);
            Route::delete('/campeonatos/{championship}', [ChampionshipController::class, 'destroy']);
            Route::post('/campeonatos/{championship}/generar-playoffs', [ChampionshipController::class, 'generatePlayoffsFromGroup']);
            Route::post('/campeonatos/{championship}/avanzar-ronda', [ChampionshipController::class, 'advanceKnockout']);
            Route::post('/campeonatos/{championship}/partido-manual', [ChampionshipController::class, 'addManualMatch']);
        });
    });
});
