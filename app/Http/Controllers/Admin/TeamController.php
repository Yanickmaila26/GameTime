<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\Player;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index()
    {
        try {
            return response()->json([
                'teams' => Team::with('players')->orderBy('name')->get(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Internal Server Error in Index',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'gender' => 'required|in:masculino,femenino,mixto',
            'short_name' => 'required|string|max:5',
            'logo_color' => 'nullable|string|max:100',
            'logo_url' => 'nullable|string',
        ]);

        $team = Team::create($data);

        return response()->json([
            'message' => 'Equipo creado correctamente.',
            'team' => $team
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'gender' => 'required|in:masculino,femenino,mixto',
            'short_name' => 'required|string|max:5',
            'logo_color' => 'nullable|string|max:100',
            'logo_url' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $team->update($data);

        return response()->json([
            'message' => 'Equipo actualizado.',
            'team' => $team
        ]);
    }

    public function destroy(Team $team)
    {
        $team->delete();
        return response()->json([
            'message' => 'Equipo eliminado.'
        ]);
    }

    public function storePlayer(Request $request, Team $team)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'number' => 'required|integer|min:0|max:99',
            'position' => 'nullable|string|max:50',
            'gender' => 'required|in:masculino,femenino',
            'status' => 'in:activo,lesionado,suspendido',
        ]);

        if ($team->gender !== 'mixto' && $data['gender'] !== $team->gender) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => [
                    'gender' => ["El género del jugador debe coincidir con la categoría del equipo ({$team->gender})."]
                ]
            ], 422);
        }

        $player = $team->players()->create($data);

        return response()->json([
            'message' => 'Jugador agregado.',
            'player' => $player
        ]);
    }

    public function updatePlayer(Request $request, Team $team, Player $player)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'number' => 'required|integer|min:0|max:99',
            'position' => 'nullable|string|max:50',
            'gender' => 'required|in:masculino,femenino',
            'status' => 'in:activo,lesionado,suspendido',
        ]);

        if ($team->gender !== 'mixto' && $data['gender'] !== $team->gender) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => [
                    'gender' => ["El género del jugador debe coincidir con la categoría del equipo ({$team->gender})."]
                ]
            ], 422);
        }

        $player->update($data);

        return response()->json([
            'message' => 'Jugador actualizado.',
            'player' => $player
        ]);
    }

    public function destroyPlayer(Team $team, Player $player)
    {
        $player->delete();
        return response()->json([
            'message' => 'Jugador eliminado.'
        ]);
    }
}
