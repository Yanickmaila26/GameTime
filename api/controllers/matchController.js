const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*,
        ht.name as home_team_name, ht.short_name as home_short, ht.logo_color as home_color,
        at2.name as away_team_name, at2.short_name as away_short, at2.logo_color as away_color,
        c.name as championship_name, c.gender as championship_gender,
        r.name as referee_name,
        r1.name as ref1_name,
        r2.name as ref2_name
       FROM matches m
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at2 ON m.away_team_id = at2.id
       JOIN championships c ON m.championship_id = c.id
       LEFT JOIN referees r ON m.referee_id = r.id
       LEFT JOIN referees r1 ON m.ref1_id = r1.id
       LEFT JOIN referees r2 ON m.ref2_id = r2.id
       ORDER BY m.status DESC, m.round ASC, m.id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
};

const getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*,
        ht.name as home_team_name, ht.short_name as home_short, ht.logo_color as home_color,
        at2.name as away_team_name, at2.short_name as away_short, at2.logo_color as away_color,
        c.name as championship_name,
        r.name as referee_name, r.certification as referee_cert,
        r1.name as ref1_name,
        r2.name as ref2_name
       FROM matches m
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at2 ON m.away_team_id = at2.id
       JOIN championships c ON m.championship_id = c.id
       LEFT JOIN referees r ON m.referee_id = r.id
       LEFT JOIN referees r1 ON m.ref1_id = r1.id
       LEFT JOIN referees r2 ON m.ref2_id = r2.id
       WHERE m.id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Partido no encontrado' });

    const match = rows[0];

    // Get match players with stats
    const [players] = await db.query(
      `SELECT mp.*, p.name, p.number, p.position, p.gender, t.short_name as team_short
       FROM match_players mp
       JOIN players p ON mp.player_id = p.id
       JOIN teams t ON mp.team_id = t.id
       WHERE mp.match_id=?
       ORDER BY mp.team_id, p.number ASC`,
      [req.params.id]
    );

    // Get match events
    const [events] = await db.query(
      `SELECT me.*, p.name as player_name, p.number as player_number, t.short_name as team_short
       FROM match_events me
       LEFT JOIN players p ON me.player_id = p.id
       LEFT JOIN teams t ON me.team_id = t.id
       WHERE me.match_id=?
       ORDER BY me.created_at ASC`,
      [req.params.id]
    );

    res.json({ ...match, players, events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
};

// Assign referees before match
const setup = async (req, res) => {
  try {
    const { referee_id, ref1_id, ref2_id, court, scheduled_at } = req.body;
    await db.query(
      'UPDATE matches SET referee_id=?, ref1_id=?, ref2_id=?, court=?, scheduled_at=? WHERE id=?',
      [referee_id || null, ref1_id || null, ref2_id || null, court || 'Coliseo Principal', scheduled_at || null, req.params.id]
    );
    res.json({ message: 'Partido configurado' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

// Start match - load players from both teams into match_players
const start = async (req, res) => {
  try {
    const matchId = req.params.id;
    const [matchRows] = await db.query('SELECT * FROM matches WHERE id=?', [matchId]);
    if (!matchRows.length) return res.status(404).json({ message: 'Partido no encontrado' });
    const match = matchRows[0];
    if (match.status !== 'scheduled') {
      return res.status(400).json({ message: 'El partido ya fue iniciado o finalizado' });
    }

    // Load active players from both teams
    const [homePlayers] = await db.query(
      "SELECT id FROM players WHERE team_id=? AND status='activo'",
      [match.home_team_id]
    );
    const [awayPlayers] = await db.query(
      "SELECT id FROM players WHERE team_id=? AND status='activo'",
      [match.away_team_id]
    );

    for (const p of homePlayers) {
      await db.query(
        'INSERT IGNORE INTO match_players (match_id, player_id, team_id) VALUES (?, ?, ?)',
        [matchId, p.id, match.home_team_id]
      );
    }
    for (const p of awayPlayers) {
      await db.query(
        'INSERT IGNORE INTO match_players (match_id, player_id, team_id) VALUES (?, ?, ?)',
        [matchId, p.id, match.away_team_id]
      );
    }

    await db.query(
      "UPDATE matches SET status='live', current_quarter=1, started_at=NOW(), home_fouls_q=0, away_fouls_q=0 WHERE id=?",
      [matchId]
    );

    await db.query(
      "INSERT INTO match_events (match_id, quarter, type, description) VALUES (?, 1, 'quarter_end', 'Partido iniciado - 1er Período')",
      [matchId]
    );

    res.json({ message: 'Partido iniciado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
};

// Add score to player
const addScore = async (req, res) => {
  try {
    const { player_id, team_id, points } = req.body;
    const matchId = req.params.id;

    if (![1, 2, 3].includes(parseInt(points))) {
      return res.status(400).json({ message: 'Puntos inválidos (1, 2 o 3)' });
    }

    const [matchRows] = await db.query('SELECT * FROM matches WHERE id=?', [matchId]);
    if (!matchRows.length || matchRows[0].status !== 'live') {
      return res.status(400).json({ message: 'El partido no está en juego' });
    }
    const match = matchRows[0];

    // Check player ejection
    const [mp] = await db.query(
      'SELECT * FROM match_players WHERE match_id=? AND player_id=?',
      [matchId, player_id]
    );
    if (mp.length && mp[0].is_ejected) {
      return res.status(400).json({ message: 'El jugador está expulsado' });
    }

    // Update player stats
    await db.query(
      'UPDATE match_players SET points = points + ? WHERE match_id=? AND player_id=?',
      [points, matchId, player_id]
    );

    // Update match score
    const isHome = parseInt(team_id) === match.home_team_id;
    if (isHome) {
      await db.query('UPDATE matches SET home_score = home_score + ? WHERE id=?', [points, matchId]);
    } else {
      await db.query('UPDATE matches SET away_score = away_score + ? WHERE id=?', [points, matchId]);
    }

    // Get updated match
    const [updated] = await db.query('SELECT * FROM matches WHERE id=?', [matchId]);
    const u = updated[0];

    // Get player name for event
    const [pInfo] = await db.query('SELECT name, number FROM players WHERE id=?', [player_id]);
    const pName = pInfo.length ? `#${pInfo[0].number} ${pInfo[0].name}` : 'Jugador';
    const typeMap = { 1: 'score1', 2: 'score2', 3: 'score3' };
    const descMap = { 1: 'Tiro libre', 2: 'Canasta de 2 puntos', 3: 'Triple' };

    await db.query(
      `INSERT INTO match_events (match_id, quarter, type, team_id, player_id, description, home_score_snapshot, away_score_snapshot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [matchId, u.current_quarter, typeMap[points], team_id, player_id,
       `${descMap[points]} - ${pName} (+${points} pts)`, u.home_score, u.away_score]
    );

    res.json({
      message: 'Puntos registrados',
      home_score: u.home_score,
      away_score: u.away_score
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
};

// Add foul to player
const addFoul = async (req, res) => {
  try {
    const { player_id, team_id } = req.body;
    const matchId = req.params.id;

    const [matchRows] = await db.query('SELECT * FROM matches WHERE id=?', [matchId]);
    if (!matchRows.length || matchRows[0].status !== 'live') {
      return res.status(400).json({ message: 'El partido no está en juego' });
    }
    const match = matchRows[0];

    const [mp] = await db.query(
      'SELECT * FROM match_players WHERE match_id=? AND player_id=?',
      [matchId, player_id]
    );
    if (!mp.length) return res.status(404).json({ message: 'Jugador no encontrado en el partido' });
    if (mp[0].is_ejected) return res.status(400).json({ message: 'El jugador ya está expulsado' });

    // Increment player foul
    const newFouls = mp[0].fouls + 1;
    const isEjected = newFouls >= 5;

    await db.query(
      'UPDATE match_players SET fouls=?, is_ejected=? WHERE match_id=? AND player_id=?',
      [newFouls, isEjected ? 1 : 0, matchId, player_id]
    );

    // Increment team collective foul for this quarter
    const isHome = parseInt(team_id) === match.home_team_id;
    let newTeamFouls;
    if (isHome) {
      await db.query('UPDATE matches SET home_fouls_q = home_fouls_q + 1 WHERE id=?', [matchId]);
      const [updated] = await db.query('SELECT home_fouls_q FROM matches WHERE id=?', [matchId]);
      newTeamFouls = updated[0].home_fouls_q;
    } else {
      await db.query('UPDATE matches SET away_fouls_q = away_fouls_q + 1 WHERE id=?', [matchId]);
      const [updated] = await db.query('SELECT away_fouls_q FROM matches WHERE id=?', [matchId]);
      newTeamFouls = updated[0].away_fouls_q;
    }

    const [pInfo] = await db.query('SELECT name, number FROM players WHERE id=?', [player_id]);
    const pName = pInfo.length ? `#${pInfo[0].number} ${pInfo[0].name}` : 'Jugador';

    // Register foul event
    await db.query(
      `INSERT INTO match_events (match_id, quarter, type, team_id, player_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [matchId, match.current_quarter, isEjected ? 'eject' : 'foul', team_id, player_id,
       isEjected ? `🚨 EXPULSIÓN - ${pName} (5 faltas)` : `Falta personal - ${pName} (${newFouls}/5)`]
    );

    // Check for free throw bonus (4 collective fouls in quarter)
    let foulBonusAlert = null;
    if (newTeamFouls === 4) {
      const [tInfo] = await db.query('SELECT name FROM teams WHERE id=?', [team_id]);
      const teamName = tInfo.length ? tInfo[0].name : 'Equipo';
      foulBonusAlert = `⚠️ ${teamName} llegó a 4 faltas colectivas. ¡Tiro libre en cada falta!`;
      await db.query(
        `INSERT INTO match_events (match_id, quarter, type, team_id, description)
         VALUES (?, ?, 'foul_bonus', ?, ?)`,
        [matchId, match.current_quarter, team_id, foulBonusAlert]
      );
    }

    res.json({
      message: isEjected ? `${pName} ha sido expulsado por 5 faltas` : 'Falta registrada',
      fouls: newFouls,
      is_ejected: isEjected,
      team_fouls: newTeamFouls,
      foul_bonus_alert: foulBonusAlert
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
};

// Advance quarter
const nextQuarter = async (req, res) => {
  try {
    const matchId = req.params.id;
    const [matchRows] = await db.query('SELECT * FROM matches WHERE id=?', [matchId]);
    if (!matchRows.length || matchRows[0].status !== 'live') {
      return res.status(400).json({ message: 'El partido no está en juego' });
    }
    const match = matchRows[0];
    const nextQ = match.current_quarter + 1;

    if (nextQ > 4) {
      return res.status(400).json({ message: 'Usa el endpoint de finalizar partido' });
    }

    // Reset collective fouls for new quarter
    await db.query(
      'UPDATE matches SET current_quarter=?, home_fouls_q=0, away_fouls_q=0 WHERE id=?',
      [nextQ, matchId]
    );

    await db.query(
      `INSERT INTO match_events (match_id, quarter, type, description)
       VALUES (?, ?, 'quarter_end', ?)`,
      [matchId, nextQ, `Inicio del ${nextQ}° Período`]
    );

    res.json({ message: `Período ${nextQ} iniciado`, current_quarter: nextQ });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

// Finish match
const finish = async (req, res) => {
  try {
    const matchId = req.params.id;
    const [matchRows] = await db.query('SELECT * FROM matches WHERE id=?', [matchId]);
    if (!matchRows.length || matchRows[0].status !== 'live') {
      return res.status(400).json({ message: 'El partido no está en juego' });
    }
    const match = matchRows[0];

    await db.query(
      "UPDATE matches SET status='finished', finished_at=NOW() WHERE id=?",
      [matchId]
    );

    await db.query(
      `INSERT INTO match_events (match_id, quarter, type, description, home_score_snapshot, away_score_snapshot)
       VALUES (?, ?, 'match_end', ?, ?, ?)`,
      [matchId, match.current_quarter, `Partido finalizado. Resultado: ${match.home_score} - ${match.away_score}`,
       match.home_score, match.away_score]
    );

    // Update championship team standings
    const homeWon = match.home_score > match.away_score;
    const diff = match.home_score - match.away_score;

    // Update home team
    await db.query(
      `UPDATE championship_teams SET 
        pj = pj + 1,
        pg = pg + ?,
        pp = pp + ?,
        pts = pts + ?,
        dif = dif + ?
       WHERE championship_id=? AND team_id=?`,
      [homeWon ? 1 : 0, homeWon ? 0 : 1, homeWon ? 2 : 1, diff, match.championship_id, match.home_team_id]
    );

    // Update away team
    await db.query(
      `UPDATE championship_teams SET 
        pj = pj + 1,
        pg = pg + ?,
        pp = pp + ?,
        pts = pts + ?,
        dif = dif + ?
       WHERE championship_id=? AND team_id=?`,
      [homeWon ? 0 : 1, homeWon ? 1 : 0, homeWon ? 1 : 2, -diff, match.championship_id, match.away_team_id]
    );

    res.json({
      message: 'Partido finalizado',
      home_score: match.home_score,
      away_score: match.away_score
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
};

module.exports = { getAll, getOne, setup, start, addScore, addFoul, nextQuarter, finish };
