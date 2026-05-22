const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND active = 1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const me = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase().trim(), hash, role]
    );
    res.status(201).json({ id: result.insertId, name, email, role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }
    res.status(500).json({ message: 'Error interno' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, active, password } = req.body;
    let query = 'UPDATE users SET name=?, email=?, role=?, active=?';
    let params = [name, email, role, active ?? 1];
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query += ', password=?';
      params.push(hash);
    }
    query += ' WHERE id=?';
    params.push(id);
    await db.query(query, params);
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE users SET active=0 WHERE id=?', [id]);
    res.json({ message: 'Usuario desactivado' });
  } catch (err) {
    res.status(500).json({ message: 'Error interno' });
  }
};

module.exports = { login, me, getUsers, createUser, updateUser, deleteUser };
