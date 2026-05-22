<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Referee extends Model
{
    protected $fillable = ['name', 'certification', 'phone', 'email', 'status'];

    public function matches()
    {
        return $this->hasMany(Game::class, 'referee_id');
    }
}
