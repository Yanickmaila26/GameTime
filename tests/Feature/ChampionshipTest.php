<?php

namespace Tests\Feature;

use App\Models\Championship;
use App\Models\Game;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChampionshipTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Bootstrap Spatie permission tables (run seeder)
        $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);

        $this->admin = User::factory()->create([
            'role'   => 'admin',
            'active' => true,
        ]);
        $this->admin->assignRole('admin');
    }

    /** @test */
    public function admin_can_create_championship_with_group_stage()
    {
        $teams = Team::factory()->count(4)->masculino()->create();

        $response = $this->actingAs($this->admin)->post('/admin/campeonatos', [
            'name'            => 'Torneo de Invierno 2026',
            'gender'          => 'masculino',
            'total_teams'     => 4,
            'has_group_stage' => true,
            'rounds'          => 2,
            'has_third_place' => true,
            'team_ids'        => $teams->pluck('id')->toArray(),
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('championships', [
            'name'            => 'Torneo de Invierno 2026',
            'has_group_stage' => 1,
            'rounds'          => 2,
            'has_third_place' => 1,
            'status'          => 'draft',
        ]);

        $championship = Championship::where('name', 'Torneo de Invierno 2026')->first();
        $this->assertCount(4, $championship->teams);
    }

    /** @test */
    public function activating_group_stage_championship_generates_round_robin_matches()
    {
        $teams = Team::factory()->count(4)->masculino()->create();

        $championship = Championship::create([
            'name'            => 'Test Torneo',
            'gender'          => 'masculino',
            'total_teams'     => 4,
            'has_group_stage' => true,
            'rounds'          => 1,
            'has_third_place' => false,
            'status'          => 'draft',
            'created_by'      => $this->admin->id,
        ]);
        $championship->teams()->attach($teams->pluck('id'));

        $response = $this->actingAs($this->admin)->put("/admin/campeonatos/{$championship->id}", [
            'name'   => 'Test Torneo',
            'status' => 'active',
        ]);

        $response->assertRedirect();

        // 4 teams, 1 round: C(4,2) = 6 matches
        $this->assertCount(6, Game::where('championship_id', $championship->id)->get());
        $this->assertDatabaseHas('matches', [
            'championship_id' => $championship->id,
            'stage'           => 'group',
            'status'          => 'scheduled',
        ]);
    }

    /** @test */
    public function activating_knockout_championship_generates_semifinal_bracket()
    {
        $teams = Team::factory()->count(4)->masculino()->create();

        $championship = Championship::create([
            'name'            => 'Copa Eliminatoria',
            'gender'          => 'masculino',
            'total_teams'     => 4,
            'has_group_stage' => false,
            'rounds'          => 1,
            'has_third_place' => true,
            'status'          => 'draft',
            'created_by'      => $this->admin->id,
        ]);
        $championship->teams()->attach($teams->pluck('id'));

        $this->actingAs($this->admin)->put("/admin/campeonatos/{$championship->id}", [
            'name'   => 'Copa Eliminatoria',
            'status' => 'active',
        ]);

        // 4 teams direct knockout => 2 Semifinal matches
        $matches = Game::where('championship_id', $championship->id)->get();
        $this->assertCount(2, $matches);
        $this->assertEquals('playoff', $matches->first()->stage);
        $this->assertEquals('Semifinal', $matches->first()->label);
    }

    /** @test */
    public function knockout_with_invalid_team_count_aborts()
    {
        $teams = Team::factory()->count(3)->masculino()->create();

        $championship = Championship::create([
            'name'            => 'Copa Invalida',
            'gender'          => 'masculino',
            'total_teams'     => 3,
            'has_group_stage' => false,
            'rounds'          => 1,
            'has_third_place' => false,
            'status'          => 'draft',
            'created_by'      => $this->admin->id,
        ]);
        $championship->teams()->attach($teams->pluck('id'));

        $response = $this->actingAs($this->admin)->put("/admin/campeonatos/{$championship->id}", [
            'name'   => 'Copa Invalida',
            'status' => 'active',
        ]);

        // abort(400) when team count is not 4/8/16/32
        $response->assertStatus(400);
    }

    /** @test */
    public function group_stage_with_two_rounds_doubles_matches()
    {
        $teams = Team::factory()->count(4)->masculino()->create();

        $championship = Championship::create([
            'name'            => 'Torneo Ida Vuelta',
            'gender'          => 'masculino',
            'total_teams'     => 4,
            'has_group_stage' => true,
            'rounds'          => 2,
            'has_third_place' => false,
            'status'          => 'draft',
            'created_by'      => $this->admin->id,
        ]);
        $championship->teams()->attach($teams->pluck('id'));

        $this->actingAs($this->admin)->put("/admin/campeonatos/{$championship->id}", [
            'name'   => 'Torneo Ida Vuelta',
            'status' => 'active',
        ]);

        // 4 teams, 2 rounds: 6 × 2 = 12 matches
        $count = Game::where('championship_id', $championship->id)->count();
        $this->assertEquals(12, $count);
    }
}
