<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchEvent extends Model
{
    public $timestamps = false;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'match_id', 'quarter', 'type', 'team_id', 'player_id',
        'description', 'home_score_snapshot', 'away_score_snapshot',
    ];

    protected $casts = ['created_at' => 'datetime'];

    public function game()
    {
        return $this->belongsTo(Game::class, 'match_id');
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
