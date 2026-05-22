<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchPlayer extends Model
{
    public $timestamps = false;

    protected $fillable = ['match_id', 'player_id', 'team_id', 'points', 'fouls', 'is_ejected'];

    protected $casts = ['is_ejected' => 'boolean'];

    public function game()
    {
        return $this->belongsTo(Game::class, 'match_id');
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
