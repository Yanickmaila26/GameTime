const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM championship_teams ct WHERE ct.championship_id = c.id) as teams_count
       FROM championships c
       LEFT JOIN users u ON c.created_by = u.id
       ORDER BY c.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const getOne = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM championship_teams ct WHERE ct.championship_id = c.id) as teams_count
       FROM championships c WHERE c.id=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Campeonato no encontrado' });

    const [teams] = await db.query(
      `SELECT ct.*, t.name, t.short_name, t.logo_color, t.gender
       FROM championship_teams ct
       JOIN teams t ON ct.team_id = t.id
       WHERE ct.championship_id=?
       ORDER BY ct.pts DESC, ct.dif DESC`,
      [req.params.id]
    );

    const [matches] = await db.query(
      `SELECT m.*,
        ht.name as home_team_name, ht.short_name as home_short, ht.logo_color as home_color,
        at2.name as away_team_name, at2.short_name as away_short, at2.logo_color as away_color,
        r.name as referee_name
       FROM matches m
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at2 ON m.away_team_id = at2.id
       LEFT JOIN referees r ON m.referee_id = r.id
       WHERE m.championship_id=?
       ORDER BY m.round ASC, m.id ASC`,
      [req.params.id]
    );

    res.json({ ...rows[0], teams, matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
};

const create = async (req, res) => {
  try {
    const { name, gender, total_teams } = req.body;
    if (!name || !gender || !total_teams) {
      return res.status(400).json({ message: 'Nombre, género y total de equipos son requeridos' });
    }
    const [result] = await db.query(
      'INSERT INTO championships (name, gender, total_teams, created_by) VALUES (?, ?, ?, ?)',
      [name, gender, total_teams, req.user.id]
    );
    const [champ] = await db.query('SELECT * FROM championships WHERE id=?', [result.insertId]);
    res.status(201).json(champ[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const update = async (req, res) => {
  try {
    const { name, status } = req.body;
    await db.query('UPDATE championships SET name=?, status=? WHERE id=?', [name, status, req.params.id]);
    res.json({ message: 'Campeonato actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const addTeam = async (req, res) => {
  try {
    const { team_id } = req.body;
    const champId = req.params.id;
    const [champ] = await db.query('SELECT * FROM championships WHERE id=?', [champId]);
    if (!champ.length) return res.status(404).json({ message: 'Campeonato no encontrado' });
    const [current] = await db.query(
      'SELECT COUNT(*) as cnt FROM championship_teams WHERE championship_id=?', [champId]
    );
    if (current[0].cnt >= champ[0].total_teams) {
      return res.status(400).json({ message: `El campeonato ya tiene el máximo de ${champ[0].total_teams} equipos` });
    }
    await db.query(
      'INSERT IGNORE INTO championship_teams (championship_id, team_id) VALUES (?, ?)',
      [champId, team_id]
    );
    res.json({ message: 'Equipo agregado al campeonato' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const removeTeam = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM championship_teams WHERE championship_id=? AND team_id=?',
      [req.params.id, req.params.teamId]
    );
    res.json({ message: 'Equipo eliminado del campeonato' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

// Sorteo automático y generación de fixture Round Robin
const draw = async (req, res) => {
  try {
    const champId = req.params.id;
    const [champ] = await db.query('SELECT * FROM championships WHERE id=?', [champId]);
    if (!champ.length) return res.status(404).json({ message: 'Campeonato no encontrado' });
    if (champ[0].status !== 'draft') {
      return res.status(400).json({ message: 'El campeonato ya fue sorteado' });
    }
    const [teams] = await db.query(
      'SELECT team_id FROM championship_teams WHERE championship_id=?', [champId]
    );
    if (teams.length < 2) {
      return res.status(400).json({ message: 'Se necesitan al menos 2 equipos para el sorteo' });
    }

    // Fisher-Yates shuffle for random seeding
    const teamIds = teams.map(t => t.team_id);
    for (let i = teamIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [teamIds[i], teamIds[j]] = [teamIds[j], teamIds[i]];
    }

    // Assign seeds
    for (let i = 0; i < teamIds.length; i++) {
      await db.query(
        'UPDATE championship_teams SET seed=? WHERE championship_id=? AND team_id=?',
        [i + 1, champId, teamIds[i]]
      );
    }

    // Generate Round Robin fixture
    // If odd number of teams, add a "bye" placeholder
    let participants = [...teamIds];
    if (participants.length % 2 !== 0) participants.push(null);
    const n = participants.length;
    const rounds = n - 1;
    const half = n / 2;
    let round = 1;

    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < half; i++) {
        const home = participants[i];
        const away = participants[n - 1 - i];
        if (home !== null && away !== null) {
          await db.query(
            `INSERT INTO matches (championship_id, round, home_team_id, away_team_id, status)
             VALUES (?, ?, ?, ?, 'scheduled')`,
            [champId, round, home, away]
          );
        }
      }
      round++;
      // Rotate (fix first element, rotate the rest)
      participants = [
        participants[0],
        participants[n - 1],
        ...participants.slice(1, n - 1)
      ];
    }

    // Activate championship
    await db.query("UPDATE championships SET status='active' WHERE id=?", [champId]);

    res.json({ message: 'Sorteo realizado con éxito. Fixture generado.', rounds: rounds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno' });
  }
};

module.exports = { getAll, getOne, create, update, addTeam, removeTeam, draw };
