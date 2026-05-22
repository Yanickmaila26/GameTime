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
        Schema::table('championships', function (Blueprint $table) {
            $table->boolean('has_group_stage')->default(false)->after('total_teams');
            $table->integer('rounds')->default(1)->after('has_group_stage');
            $table->boolean('has_third_place')->default(false)->after('rounds');
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->enum('stage', ['group', 'playoff'])->default('group')->after('championship_id');
            $table->string('label', 100)->nullable()->after('stage');
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->longText('logo_url')->nullable()->after('logo_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('championships', function (Blueprint $table) {
            $table->dropColumn(['has_group_stage', 'rounds', 'has_third_place']);
        });

        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn(['stage', 'label']);
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn('logo_url');
        });
    }
};
