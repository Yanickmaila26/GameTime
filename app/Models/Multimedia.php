<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Multimedia extends Model
{
    protected $table = 'multimedia';

    protected $fillable = ['team_id', 'file_path', 'title', 'type'];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
