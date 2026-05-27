<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Championship;
use App\Models\Team;
use App\Models\Game;
use Illuminate\Http\Request;

class ChampionshipController extends Controller
{
    public function index()
    {
        try {
            return response()->json([
                'championships' => Championship::with(['teams', 'creator', 'matches.homeTeam', 'matches.awayTeam'])->latest()->get(),
                'teams' => Team::where('active', true)->orderBy('name')->get(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Internal Server Error in Index',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:150',
            'gender'          => 'required|in:masculino,femenino,mixto',
            'has_group_stage' => 'boolean',
            'rounds'          => 'integer|min:1|max:10',
            'has_third_place' => 'boolean',
            'team_ids'        => 'array|min:2',
            'team_ids.*'      => 'exists:teams,id',
        ]);

        $hasGroupStage = $data['has_group_stage'] ?? false;
        $teamCount     = count($data['team_ids'] ?? []);

        // Knockout requires exactly 4, 8, 16 or 32 teams
        if (!$hasGroupStage && !in_array($teamCount, [4, 8, 16, 32])) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => [
                    'team_ids' => ["La eliminación directa requiere exactamente 4, 8, 16 o 32 equipos. Se seleccionaron: {$teamCount}."]
                ]
            ], 422);
        }

        $championship = Championship::create([
            'name'            => $data['name'],
            'gender'          => $data['gender'],
            'total_teams'     => $teamCount,
            'has_group_stage' => $hasGroupStage,
            'rounds'          => $data['rounds'] ?? 1,
            'has_third_place' => $data['has_third_place'] ?? false,
            'created_by'      => auth()->id(),
        ]);

        if (!empty($data['team_ids'])) {
            $championship->teams()->attach($data['team_ids']);
        }

        return response()->json([
            'message' => 'Campeonato creado.',
            'championship' => $championship
        ]);
    }

    public function update(Request $request, Championship $championship)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:150',
            'status'           => 'in:draft,active,finished',
            'start_date'       => 'nullable|date',
            'play_days'        => 'nullable|array',
            'play_days.*'      => 'integer|min:0|max:6',
            'matches_per_day'  => 'nullable|integer|min:1|max:20',
            'generate_matches' => 'nullable|boolean',
        ]);

        $oldStatus = $championship->status;
        $newStatus = $data['status'] ?? $championship->status;

        /*
        if ($newStatus === 'active' && $oldStatus === 'draft') {
            // Validate all teams in the championship have at least 2 players
            $teams = $championship->teams()->with('players')->get();
            $invalidTeams = $teams->filter(fn($t) => $t->players->count() < 2);
            if ($invalidTeams->isNotEmpty()) {
                $names = $invalidTeams->pluck('name')->join(', ');
                return response()->json([
                    'message' => 'Error de validación.',
                    'errors' => [
                        'status' => ["Los siguientes equipos tienen menos de 2 jugadores: {$names}. Agrega jugadores antes de iniciar."]
                    ]
                ], 422);
            }
        }
        */

        $championship->update(array_filter([
            'name'           => $data['name'],
            'status'         => $data['status'] ?? $championship->status,
            'start_date'     => $data['start_date'] ?? $championship->start_date,
            'play_days'      => $data['play_days'] ?? $championship->play_days,
            'matches_per_day'=> $data['matches_per_day'] ?? $championship->matches_per_day,
        ], fn($v) => !is_null($v)));

        if ($championship->status === 'active' && $oldStatus === 'draft') {
            $generateMatches = filter_var($request->input('generate_matches', true), FILTER_VALIDATE_BOOLEAN);
            if ($generateMatches) {
                $this->generateInitialMatches($championship);
            }
        }

        return response()->json([
            'message' => 'Campeonato actualizado.',
            'championship' => $championship
        ]);
    }

    public function destroy(Championship $championship)
    {
        $championship->delete();
        return response()->json([
            'message' => 'Campeonato eliminado.'
        ]);
    }

    private function generateInitialMatches(Championship $championship)
    {
        $teams     = $championship->teams()->with('players')->get()->shuffle()->all();
        $teamCount = count($teams);

        // --- Build an ordered list of scheduled dates ---
        $scheduledDates = $this->buildScheduleDates(
            $championship->start_date,
            $championship->play_days ?? [],
            $championship->matches_per_day ?? 2
        );
        $dateIndex = 0;

        if ($championship->has_group_stage) {
            if ($teamCount < 2) return;

            $teamsList = $teams;
            if ($teamCount % 2 !== 0) {
                $teamsList[] = null; // bye
            }
            $n      = count($teamsList);
            $vueltas = $championship->rounds ?? 1;

            for ($v = 0; $v < $vueltas; $v++) {
                $tempTeams = $teamsList;
                for ($r = 0; $r < $n - 1; $r++) {
                    $roundNum = ($v * ($n - 1)) + $r + 1;

                    for ($i = 0; $i < $n / 2; $i++) {
                        $home = $tempTeams[$i];
                        $away = $tempTeams[$n - 1 - $i];

                        if ($home !== null && $away !== null) {
                            $homeId = ($v % 2 === 1) ? $away->id : $home->id;
                            $awayId = ($v % 2 === 1) ? $home->id : $away->id;

                            $scheduledAt = isset($scheduledDates[$dateIndex]) ? $scheduledDates[$dateIndex] : null;
                            $dateIndex++;

                            Game::create([
                                'championship_id' => $championship->id,
                                'round'           => $roundNum,
                                'home_team_id'    => $homeId,
                                'away_team_id'    => $awayId,
                                'stage'           => 'group',
                                'status'          => 'scheduled',
                                'scheduled_at'    => $scheduledAt,
                            ]);
                        }
                    }

                    // Rotate list (keep first element fixed)
                    $last = array_pop($tempTeams);
                    array_splice($tempTeams, 1, 0, [$last]);
                }
            }
        } else {
            // Direct Knockout
            if (!in_array($teamCount, [4, 8, 16, 32])) {
                abort(400, 'El número de equipos para eliminación directa debe ser 4, 8, 16 o 32.');
            }

            $label = $this->getKnockoutLabel($teamCount);

            for ($i = 0; $i < $teamCount; $i += 2) {
                $scheduledAt = isset($scheduledDates[$dateIndex]) ? $scheduledDates[$dateIndex] : null;
                $dateIndex++;

                Game::create([
                    'championship_id' => $championship->id,
                    'round'           => 1,
                    'home_team_id'    => $teams[$i]->id,
                    'away_team_id'    => $teams[$i + 1]->id,
                    'stage'           => 'playoff',
                    'label'           => $label,
                    'status'          => 'scheduled',
                    'scheduled_at'    => $scheduledAt,
                ]);
            }
        }
    }

    private function buildScheduleDates($startDate, array $playDays, int $matchesPerDay): array
    {
        if (!$startDate || empty($playDays)) {
            return []; // no dates → scheduled_at will be null
        }

        sort($playDays);
        $dates      = [];
        $current    = \Carbon\Carbon::parse($startDate)->startOfDay();
        $maxDays    = 365; // safety cap
        $dayChecked = 0;

        while ($dayChecked < $maxDays) {
            $dow = (int) $current->dayOfWeek; // 0 = Sunday, 6 = Saturday
            if (in_array($dow, $playDays)) {
                for ($m = 0; $m < $matchesPerDay; $m++) {
                    $dates[] = $current->copy()->setTime(19 + $m, 0); // 19:00, 20:00, ...
                }
            }
            $current->addDay();
            $dayChecked++;

            // Stop building once we have a generous pool
            if (count($dates) >= 500) break;
        }

        return $dates;
    }

    private function getKnockoutLabel($teamCount)
    {
        switch ($teamCount) {
            case 2: return "Final";
            case 4: return "Semifinal";
            case 8: return "Cuartos de Final";
            case 16: return "Octavos de Final";
            case 32: return "Dieciseisavos de Final";
            default: return "Eliminatoria";
        }
    }

    public function advanceKnockout(Championship $championship)
    {
        $maxRound = Game::where('championship_id', $championship->id)
            ->where('stage', 'playoff')
            ->max('round');

        if (!$maxRound) {
            return response()->json([
                'message' => 'Error.',
                'errors' => ['error' => ['No hay partidos de playoff programados.']]
            ], 422);
        }

        $matches = Game::where('championship_id', $championship->id)
            ->where('stage', 'playoff')
            ->where('round', $maxRound)
            ->get();

        $hasFinal = $matches->contains('label', 'Final');

        $pending = $matches->where('status', '!=', 'finished')->count();
        if ($pending > 0) {
            return response()->json([
                'message' => 'Error.',
                'errors' => ['error' => ['Aún hay partidos sin finalizar en esta ronda.']]
            ], 422);
        }

        if ($hasFinal) {
            $championship->update(['status' => 'finished']);
            return response()->json([
                'message' => 'El campeonato ha finalizado.'
            ]);
        }

        $isSemifinal = $matches->contains('label', 'Semifinal');

        if ($isSemifinal) {
            $semis = $matches->where('label', 'Semifinal')->values();
            if ($semis->count() < 2) {
                return response()->json([
                    'message' => 'Error.',
                    'errors' => ['error' => ['Datos de semifinal incompletos.']]
                ], 422);
            }

            $m1 = $semis[0];
            $m2 = $semis[1];

            $w1 = $m1->home_score > $m1->away_score ? $m1->home_team_id : $m1->away_team_id;
            $w2 = $m2->home_score > $m2->away_score ? $m2->home_team_id : $m2->away_team_id;

            $l1 = $m1->home_score > $m1->away_score ? $m1->away_team_id : $m1->home_team_id;
            $l2 = $m2->home_score > $m2->away_score ? $m2->away_team_id : $m2->home_team_id;

            // Create Final
            Game::create([
                'championship_id' => $championship->id,
                'round' => $maxRound + 1,
                'home_team_id' => $w1,
                'away_team_id' => $w2,
                'stage' => 'playoff',
                'label' => 'Final',
                'status' => 'scheduled',
            ]);

            // Create 3rd Place match if enabled
            if ($championship->has_third_place) {
                Game::create([
                    'championship_id' => $championship->id,
                    'round' => $maxRound + 1,
                    'home_team_id' => $l1,
                    'away_team_id' => $l2,
                    'stage' => 'playoff',
                    'label' => '3er Lugar',
                    'status' => 'scheduled',
                ]);
            }

            return response()->json([
                'message' => 'Partidos de Final (y 3er lugar) generados.'
            ]);
        }

        // For earlier rounds (e.g. Round of 16, Cuartos)
        $winners = [];
        foreach ($matches as $m) {
            $winners[] = $m->home_score > $m->away_score ? $m->home_team_id : $m->away_team_id;
        }

        $winnerCount = count($winners);
        if ($winnerCount % 2 !== 0) {
            return response()->json([
                'message' => 'Error.',
                'errors' => ['error' => ['Número de ganadores impar. No se pueden emparejar.']]
            ], 422);
        }

        $nextLabel = $this->getKnockoutLabel($winnerCount);

        for ($i = 0; $i < $winnerCount; $i += 2) {
            Game::create([
                'championship_id' => $championship->id,
                'round' => $maxRound + 1,
                'home_team_id' => $winners[$i],
                'away_team_id' => $winners[$i+1],
                'stage' => 'playoff',
                'label' => $nextLabel,
                'status' => 'scheduled',
            ]);
        }

        return response()->json([
            'message' => 'Siguiente ronda de playoffs generada.'
        ]);
    }

    public function generatePlayoffsFromGroup(Request $request, Championship $championship)
    {
        $data = $request->validate([
            'limit' => 'required|in:4,8',
        ]);

        $limit = (int) $data['limit'];
        $orderedTeams = $championship->teams()->get(); // Ordered by pts desc in relationship

        if ($orderedTeams->count() < $limit) {
            return response()->json([
                'message' => 'Error.',
                'errors' => ['error' => ["Se necesitan al menos {$limit} equipos para generar esta eliminatoria."]]
            ], 422);
        }

        $exists = Game::where('championship_id', $championship->id)->where('stage', 'playoff')->exists();
        if ($exists) {
            return response()->json([
                'message' => 'Error.',
                'errors' => ['error' => ['Ya se han generado partidos de playoff para este campeonato.']]
            ], 422);
        }

        $label = $limit === 4 ? 'Semifinal' : 'Cuartos de Final';

        for ($i = 0; $i < $limit / 2; $i++) {
            $home = $orderedTeams[$i];
            $away = $orderedTeams[$limit - 1 - $i];

            Game::create([
                'championship_id' => $championship->id,
                'round' => 1,
                'home_team_id' => $home->id,
                'away_team_id' => $away->id,
                'stage' => 'playoff',
                'label' => $label,
                'status' => 'scheduled',
            ]);
        }

        return response()->json([
            'message' => 'Fase de eliminatorias (playoffs) generada exitosamente.'
        ]);
    }

    public function addManualMatch(Request $request, Championship $championship)
    {
        $data = $request->validate([
            'home_team_id' => 'required|exists:teams,id|different:away_team_id',
            'away_team_id' => 'required|exists:teams,id',
            'round' => 'required|integer|min:1',
            'stage' => 'required|in:group,playoff',
            'label' => 'nullable|string|max:100',
            'court' => 'nullable|string|max:150',
            'scheduled_at' => 'nullable|date',
            'referee_id' => 'nullable|exists:referees,id',
        ]);

        $game = Game::create(array_merge($data, [
            'championship_id' => $championship->id,
            'status' => 'scheduled',
        ]));

        return response()->json([
            'message' => 'Partido personalizado creado.',
            'match' => $game
        ]);
    }
}
