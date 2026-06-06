<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $clearHomeCache = function () {
            \Illuminate\Support\Facades\Cache::forget('public_home_data');
        };

        \App\Models\Game::saved($clearHomeCache);
        \App\Models\Game::deleted($clearHomeCache);

        \App\Models\Championship::saved($clearHomeCache);
        \App\Models\Championship::deleted($clearHomeCache);

        \App\Models\Team::saved($clearHomeCache);
        \App\Models\Team::deleted($clearHomeCache);

        \App\Models\Player::saved($clearHomeCache);
        \App\Models\Player::deleted($clearHomeCache);

        \App\Models\MatchPlayer::saved($clearHomeCache);
        \App\Models\MatchPlayer::deleted($clearHomeCache);

        \App\Models\MatchEvent::saved($clearHomeCache);
        \App\Models\MatchEvent::deleted($clearHomeCache);

        \App\Models\Multimedia::saved($clearHomeCache);
        \App\Models\Multimedia::deleted($clearHomeCache);

        \App\Models\ChampionshipTeam::saved($clearHomeCache);
        \App\Models\ChampionshipTeam::deleted($clearHomeCache);
    }
}
