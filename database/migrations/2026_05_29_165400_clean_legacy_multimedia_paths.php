<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Delete all multimedia records that point to local storage paths,
        // since Render's ephemeral filesystem has deleted the actual files.
        DB::table('multimedia')
            ->where('file_path', 'like', '/storage/%')
            ->orWhere('file_path', 'like', 'storage/%')
            ->delete();

        // Reset logo_url to null for teams that point to local storage paths
        // so they fallback to beautiful gradient badges rather than broken image icons.
        DB::table('teams')
            ->where('logo_url', 'like', '/storage/%')
            ->orWhere('logo_url', 'like', 'storage/%')
            ->update(['logo_url' => null]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No rollback possible as files are physically deleted on Render.
    }
};
