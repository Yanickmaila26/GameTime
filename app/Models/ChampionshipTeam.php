<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChampionshipTeam extends Model
{
    public $timestamps = false;

    protected $fillable = ['championship_id', 'team_id', 'seed', 'pj', 'pg', 'pp', 'pts', 'dif', 'group_name'];

    public function championship()
    {
        return $this->belongsTo(Championship::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
