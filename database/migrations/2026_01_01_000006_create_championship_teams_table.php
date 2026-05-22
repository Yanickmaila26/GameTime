<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('championship_teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('championship_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->integer('seed')->nullable();
            $table->integer('pj')->default(0);
            $table->integer('pg')->default(0);
            $table->integer('pp')->default(0);
            $table->integer('pts')->default(0);
            $table->integer('dif')->default(0);
            $table->unique(['championship_id', 'team_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('championship_teams');
    }
};
