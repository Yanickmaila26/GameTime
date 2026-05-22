<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = ['name', 'gender', 'short_name', 'logo_color', 'active'];

    protected $casts = ['active' => 'boolean'];

    public function players()
    {
        return $this->hasMany(Player::class);
    }

    public function championships()
    {
        return $this->belongsToMany(Championship::class, 'championship_teams')
            ->withPivot(['seed', 'pj', 'pg', 'pp', 'pts', 'dif']);
    }

    public function homeMatches()
    {
        return $this->hasMany(Game::class, 'home_team_id');
    }

    public function awayMatches()
    {
        return $this->hasMany(Game::class, 'away_team_id');
    }
}
