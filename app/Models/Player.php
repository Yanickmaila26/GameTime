<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = ['team_id', 'name', 'number', 'position', 'gender', 'status'];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function matchStats()
    {
        return $this->hasMany(MatchPlayer::class);
    }
}
