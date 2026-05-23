<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales incorrectas.',
                'errors' => [
                    'email' => ['Credenciales incorrectas.']
                ]
            ], 422);
        }

        $user = Auth::user();

        if (!$user->active) {
            Auth::logout();
            return response()->json([
                'message' => 'Tu cuenta está desactivada.',
                'errors' => [
                    'email' => ['Tu cuenta está desactivada.']
                ]
            ], 403);
        }

        // Generate Sanctum API Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'active' => $user->active,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente.'
        ]);
    }
}
