const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM referees WHERE status='activo' ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const getAllIncludingInactive = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM referees ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const create = async (req, res) => {
  try {
    const { name, certification, phone, email } = req.body;
    if (!name) return res.status(400).json({ message: 'Nombre es requerido' });
    const [result] = await db.query(
      'INSERT INTO referees (name, certification, phone, email) VALUES (?, ?, ?, ?)',
      [name, certification || 'FIBA', phone || null, email || null]
    );
    const [ref] = await db.query('SELECT * FROM referees WHERE id=?', [result.insertId]);
    res.status(201).json(ref[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const update = async (req, res) => {
  try {
    const { name, certification, phone, email, status } = req.body;
    await db.query(
      'UPDATE referees SET name=?, certification=?, phone=?, email=?, status=? WHERE id=?',
      [name, certification, phone || null, email || null, status || 'activo', req.params.id]
    );
    res.json({ message: 'Árbitro actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const remove = async (req, res) => {
  try {
    await db.query("UPDATE referees SET status='inactivo' WHERE id=?", [req.params.id]);
    res.json({ message: 'Árbitro desactivado' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

module.exports = { getAll, getAllIncludingInactive, create, update, remove };
