<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()['cache']->forget('spatie.permission.cache');

        $permissions = [
            // Teams
            'view_teams',
            'create_teams',
            'edit_teams',
            'delete_teams',

            // Players
            'view_players',
            'create_players',
            'edit_players',
            'delete_players',

            // Referees
            'view_referees',
            'create_referees',
            'edit_referees',
            'delete_referees',

            // Championships
            'view_championships',
            'create_championships',
            'edit_championships',
            'delete_championships',

            // Matches
            'view_matches',
            'create_matches',
            'edit_matches',
            'delete_matches',
            'manage_match_events',
            'manage_match_scoring',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $directivaRole = Role::firstOrCreate(['name' => 'directiva']);

        $adminRole->syncPermissions($permissions);

        $directivaPermissions = [
            'view_teams',
            'view_players',
            'view_referees',
            'view_championships',
            'view_matches',
            'manage_match_events',
            'manage_match_scoring',
        ];

        $directivaRole->syncPermissions($directivaPermissions);
    }
}
