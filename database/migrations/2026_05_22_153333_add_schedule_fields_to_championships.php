<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('championships', function (Blueprint $table) {
            // Scheduling configuration for fixture generation
            $table->date('start_date')->nullable()->after('has_third_place');
            $table->json('play_days')->nullable()->after('start_date');   // e.g. [1,3,5] = Mon, Wed, Fri
            $table->unsignedTinyInteger('matches_per_day')->default(2)->after('play_days');
        });
    }

    public function down(): void
    {
        Schema::table('championships', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'play_days', 'matches_per_day']);
        });
    }
};
