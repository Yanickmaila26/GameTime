<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@gametime.ec'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('Admin2026!'),
                'role' => 'admin',
                'active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'directiva@gametime.ec'],
            [
                'name' => 'Directiva',
                'password' => Hash::make('Admin2026!'),
                'role' => 'directiva',
                'active' => true,
            ]
        );
    }
}
