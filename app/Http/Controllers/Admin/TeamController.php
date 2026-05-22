<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\Player;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Teams', [
            'teams' => Team::with('players')->orderBy('name')->get(),
        ]);
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

        Team::create($data);

        return back()->with('success', 'Equipo creado correctamente.');
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

        return back()->with('success', 'Equipo actualizado.');
    }

    public function destroy(Team $team)
    {
        $team->delete();
        return back()->with('success', 'Equipo eliminado.');
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
            return back()->withErrors(['gender' => "El género del jugador debe coincidir con la categoría del equipo ({$team->gender})."]);
        }

        $team->players()->create($data);

        return back()->with('success', 'Jugador agregado.');
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
            return back()->withErrors(['gender' => "El género del jugador debe coincidir con la categoría del equipo ({$team->gender})."]);
        }

        $player->update($data);

        return back()->with('success', 'Jugador actualizado.');
    }

    public function destroyPlayer(Team $team, Player $player)
    {
        $player->delete();
        return back()->with('success', 'Jugador eliminado.');
    }
}
