const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const { gender } = req.query;
    let query = 'SELECT * FROM teams WHERE active=1';
    const params = [];
    if (gender) { query += ' AND gender=?'; params.push(gender); }
    query += ' ORDER BY name ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const getOne = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM teams WHERE id=? AND active=1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Equipo no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const create = async (req, res) => {
  try {
    const { name, gender, short_name, logo_color } = req.body;
    if (!name || !gender || !short_name) {
      return res.status(400).json({ message: 'Nombre, género y siglas son requeridos' });
    }
    const [result] = await db.query(
      'INSERT INTO teams (name, gender, short_name, logo_color) VALUES (?, ?, ?, ?)',
      [name, gender, short_name.toUpperCase().substring(0, 5), logo_color || 'from-orange-500 to-amber-600']
    );
    const [newTeam] = await db.query('SELECT * FROM teams WHERE id=?', [result.insertId]);
    res.status(201).json(newTeam[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const update = async (req, res) => {
  try {
    const { name, gender, short_name, logo_color, active } = req.body;
    await db.query(
      'UPDATE teams SET name=?, gender=?, short_name=?, logo_color=?, active=? WHERE id=?',
      [name, gender, short_name?.toUpperCase().substring(0, 5), logo_color, active ?? 1, req.params.id]
    );
    res.json({ message: 'Equipo actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const remove = async (req, res) => {
  try {
    await db.query('UPDATE teams SET active=0 WHERE id=?', [req.params.id]);
    res.json({ message: 'Equipo eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

// ---- JUGADORES ----
const getPlayers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM players WHERE team_id=? ORDER BY number ASC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const addPlayer = async (req, res) => {
  try {
    const { name, number, position, gender, status } = req.body;
    const teamId = req.params.id;
    if (!name || !number || !gender) {
      return res.status(400).json({ message: 'Nombre, número y género son requeridos' });
    }
    const [result] = await db.query(
      'INSERT INTO players (team_id, name, number, position, gender, status) VALUES (?, ?, ?, ?, ?, ?)',
      [teamId, name, number, position || null, gender, status || 'activo']
    );
    const [newPlayer] = await db.query('SELECT * FROM players WHERE id=?', [result.insertId]);
    res.status(201).json(newPlayer[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El número de camiseta ya está en uso en este equipo' });
    }
    res.status(500).json({ message: 'Error interno' });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const { name, number, position, gender, status } = req.body;
    await db.query(
      'UPDATE players SET name=?, number=?, position=?, gender=?, status=? WHERE id=?',
      [name, number, position || null, gender, status, req.params.playerId]
    );
    res.json({ message: 'Jugador actualizado' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El número de camiseta ya está en uso' });
    }
    res.status(500).json({ message: 'Error interno' });
  }
};

const deletePlayer = async (req, res) => {
  try {
    await db.query('DELETE FROM players WHERE id=?', [req.params.playerId]);
    res.json({ message: 'Jugador eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

module.exports = { getAll, getOne, create, update, remove, getPlayers, addPlayer, updatePlayer, deletePlayer };
