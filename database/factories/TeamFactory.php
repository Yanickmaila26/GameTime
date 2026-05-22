<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Team>
 */
class TeamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->city() . ' FC';
        return [
            'name'       => $name,
            'short_name' => strtoupper(substr($name, 0, 3)),
            'gender'     => fake()->randomElement(['masculino', 'femenino']),
            'logo_color' => fake()->hexColor(),
            'logo_url'   => null,
            'active'     => true,
        ];
    }

    /** Masculino state */
    public function masculino(): static
    {
        return $this->state(fn (array $attrs) => ['gender' => 'masculino']);
    }

    /** Femenino state */
    public function femenino(): static
    {
        return $this->state(fn (array $attrs) => ['gender' => 'femenino']);
    }
}
