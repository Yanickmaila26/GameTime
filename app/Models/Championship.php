<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Championship extends Model
{
    protected $fillable = [
        'name', 'gender', 'total_teams', 'status', 'created_by',
        'has_group_stage', 'rounds', 'has_third_place',
        'start_date', 'play_days', 'matches_per_day',
    ];

    protected $casts = [
        'has_group_stage'  => 'boolean',
        'has_third_place'  => 'boolean',
        'rounds'           => 'integer',
        'matches_per_day'  => 'integer',
        'start_date'       => 'date',
        'play_days'        => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class, 'championship_teams')
            ->withPivot(['seed', 'pj', 'pg', 'pp', 'pts', 'dif', 'group_name'])
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
