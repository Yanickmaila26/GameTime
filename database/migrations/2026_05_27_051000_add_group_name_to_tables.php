<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('championship_teams', 'group_name')) {
            Schema::table('championship_teams', function (Blueprint $table) {
                $table->string('group_name', 50)->nullable()->after('team_id');
            });
        }

        if (!Schema::hasColumn('matches', 'group_name')) {
            Schema::table('matches', function (Blueprint $table) {
                $table->string('group_name', 50)->nullable()->after('stage');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('championship_teams', function (Blueprint $table) {
            $table->dropColumn('group_name');
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn('group_name');
        });
    }
};
