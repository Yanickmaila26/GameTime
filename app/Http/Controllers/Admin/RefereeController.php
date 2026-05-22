<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Referee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RefereeController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Referees', [
            'referees' => Referee::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'certification' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
        ]);

        Referee::create($data);

        return back()->with('success', 'Árbitro creado correctamente.');
    }

    public function update(Request $request, Referee $referee)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'certification' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'status' => 'in:activo,inactivo',
        ]);

        $referee->update($data);

        return back()->with('success', 'Árbitro actualizado.');
    }

    public function destroy(Referee $referee)
    {
        $referee->delete();
        return back()->with('success', 'Árbitro eliminado.');
    }
}
