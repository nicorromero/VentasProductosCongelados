const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = { id: payload.id, role: payload.role };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.usuario?.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' });
    }
    next();
};

const isOwnerOrAdmin = (req, id) => {
    return req.usuario?.role === 'admin' || req.usuario?.id === id.toString();
};

module.exports = { authMiddleware, adminMiddleware, isOwnerOrAdmin };
