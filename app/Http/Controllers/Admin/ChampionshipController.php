<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChampionshipController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Championships', [
            'championships' => Championship::with('teams', 'creator')->latest()->get(),
            'teams' => Team::where('active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'gender' => 'required|in:masculino,femenino,mixto',
            'total_teams' => 'required|integer|min:2',
            'team_ids' => 'array',
            'team_ids.*' => 'exists:teams,id',
        ]);

        $championship = Championship::create([
            'name' => $data['name'],
            'gender' => $data['gender'],
            'total_teams' => $data['total_teams'],
            'created_by' => auth()->id(),
        ]);

        if (!empty($data['team_ids'])) {
            $championship->teams()->attach($data['team_ids']);
        }

        return back()->with('success', 'Campeonato creado.');
    }

    public function update(Request $request, Championship $championship)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'status' => 'in:draft,active,finished',
        ]);

        $championship->update($data);

        return back()->with('success', 'Campeonato actualizado.');
    }

    public function destroy(Championship $championship)
    {
        $championship->delete();
        return back()->with('success', 'Campeonato eliminado.');
    }
}
