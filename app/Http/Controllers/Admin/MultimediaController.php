<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Multimedia;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MultimediaController extends Controller
{
    public function index()
    {
        return response()->json([
            'teams' => Team::orderBy('name')->get(),
            'multimedia' => Multimedia::with('team')->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'image|mimes:jpeg,png,jpg,webp,gif|max:5120', // Max 5MB per file
            'team_id' => 'nullable|exists:teams,id',
            'title' => 'nullable|string|max:100',
        ]);

        $created = [];

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                // Read and encode to Base64 to make it persistent on ephemeral filesystems like Render
                $base64 = 'data:' . $file->getMimeType() . ';base64,' . base64_encode(file_get_contents($file));
                
                $media = Multimedia::create([
                    'team_id' => $request->team_id ?: null,
                    'file_path' => $base64,
                    'title' => $request->title ?: null,
                    'type' => 'image',
                ]);

                $created[] = $media;
            }

            return response()->json([
                'message' => 'Archivos multimedia subidos correctamente.',
                'multimedia' => $created
            ]);
        }

        return response()->json([
            'message' => 'No se pudo procesar la subida de los archivos.',
        ], 400);
    }

    public function destroy(Multimedia $media)
    {
        // Extract relative path to delete from the public disk
        $relativePath = str_replace('/storage/', '', $media->file_path);
        
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }

        $media->delete();

        return response()->json([
            'message' => 'Archivo multimedia eliminado correctamente.'
        ]);
    }
}
