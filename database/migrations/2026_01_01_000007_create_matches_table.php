<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('championship_id')->constrained()->cascadeOnDelete();
            $table->integer('round')->default(1);
            $table->foreignId('home_team_id')->constrained('teams');
            $table->foreignId('away_team_id')->constrained('teams');
            $table->foreignId('referee_id')->nullable()->constrained('referees')->nullOnDelete();
            $table->foreignId('ref1_id')->nullable()->constrained('referees')->nullOnDelete();
            $table->foreignId('ref2_id')->nullable()->constrained('referees')->nullOnDelete();
            $table->string('court', 150)->default('Coliseo Principal');
            $table->dateTime('scheduled_at')->nullable();
            $table->enum('status', ['scheduled', 'live', 'finished'])->default('scheduled');
            $table->integer('home_score')->default(0);
            $table->integer('away_score')->default(0);
            $table->integer('current_quarter')->default(0);
            $table->integer('home_fouls_q')->default(0);
            $table->integer('away_fouls_q')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
