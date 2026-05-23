<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Referee;
use Illuminate\Http\Request;

class RefereeController extends Controller
{
    public function index()
    {
        return response()->json([
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

        $referee = Referee::create($data);

        return response()->json([
            'message' => 'Árbitro creado correctamente.',
            'referee' => $referee
        ]);
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

        return response()->json([
            'message' => 'Árbitro actualizado.',
            'referee' => $referee
        ]);
    }

    public function destroy(Referee $referee)
    {
        $referee->delete();
        return response()->json([
            'message' => 'Árbitro eliminado.'
        ]);
    }
}
