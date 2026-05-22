const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Solo administradores pueden realizar esta acción' });
  }
  next();
};

const requireAdminOrDirectiva = (req, res, next) => {
  if (!['admin', 'directiva'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin, requireAdminOrDirectiva };
