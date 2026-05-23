<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'gender', 'short_name', 'logo_color', 'logo_url', 'active'];

    protected $casts = ['active' => 'boolean'];

    public function players()
    {
        return $this->hasMany(Player::class);
    }

    public function media()
    {
        return $this->hasMany(Multimedia::class);
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
