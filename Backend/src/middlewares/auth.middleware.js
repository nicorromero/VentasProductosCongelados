/**
 * Middleware de autenticación JWT.
 * Verifica el encabezado `Authorization: Bearer <token>`.
 * Si es válido, adjunta `req.user` con `id` y `role`.
 * En caso de error devuelve 401 sin exponer detalles internos.
 */
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Normalizamos el atributo para usarlo uniformemente en la base de código.
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

/**
 * Middleware que asegura que el usuario autenticado sea admin.
 */
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' });
  }
  next();
};

/**
 * Helper para validar que el usuario es propietario del recurso o admin.
 * `id` puede ser ObjectId o string.
 */
const isOwnerOrAdmin = (req, id) => {
  return req.user?.role === 'admin' || req.user?.id === id.toString();
};

module.exports = { authMiddleware, adminMiddleware, isOwnerOrAdmin };
