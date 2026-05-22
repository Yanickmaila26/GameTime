<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Championship extends Model
{
    protected $fillable = ['name', 'gender', 'total_teams', 'status', 'created_by'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class, 'championship_teams')
            ->withPivot(['seed', 'pj', 'pg', 'pp', 'pts', 'dif'])
            ->orderByPivot('pts', 'desc');
    }

    public function standings()
    {
        return $this->hasMany(ChampionshipTeam::class);
    }

    public function matches()
    {
        return $this->hasMany(Game::class);
    }
}
