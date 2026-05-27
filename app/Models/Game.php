<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $table = 'matches';

    protected $fillable = [
        'championship_id', 'round', 'home_team_id', 'away_team_id', 'forfeit_team_id',
        'referee_id', 'ref1_id', 'ref2_id', 'court', 'scheduled_at',
        'status', 'home_score', 'away_score', 'current_quarter',
        'home_fouls_q', 'away_fouls_q', 'started_at', 'finished_at',
        'stage', 'label', 'group_name',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function championship()
    {
        return $this->belongsTo(Championship::class);
    }

    public function homeTeam()
    {
        return $this->belongsTo(Team::class, 'home_team_id');
    }

    public function awayTeam()
    {
        return $this->belongsTo(Team::class, 'away_team_id');
    }

    public function forfeitTeam()
    {
        return $this->belongsTo(Team::class, 'forfeit_team_id');
    }

    public function referee()
    {
        return $this->belongsTo(Referee::class, 'referee_id');
    }

    public function ref1()
    {
        return $this->belongsTo(Referee::class, 'ref1_id');
    }

    public function ref2()
    {
        return $this->belongsTo(Referee::class, 'ref2_id');
    }

    public function players()
    {
        return $this->hasMany(MatchPlayer::class, 'match_id');
    }

    public function events()
    {
        return $this->hasMany(MatchEvent::class, 'match_id')->orderBy('created_at');
    }

    public function isLive(): bool
    {
        return $this->status === 'live';
    }
}
