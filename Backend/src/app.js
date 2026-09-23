const express = require('express');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const productsRoutes = require('./routes/products.routes');
const usersRoutes = require('./routes/users.routes');
const salesRoutes = require('./routes/sales.routes');
const cartsRoutes = require('./routes/carts.routes');
const authRoutes = require('./routes/auth.routes');
const contactRoutes = require('./routes/contact.routes');
const categoriesRoutes = require('./routes/categories.routes');
const { httpLogger, logger } = require('./middlewares/logger.middleware');
const cors = require('cors');
const app = express();

// Seguridad: Headers HTTP básicos (oculta X-Powered-By, añade X-XSS-Protection, etc.)
app.use(helmet());

// Seguridad: Sanitización contra NoSQL Injection (adaptado para Express 5)
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    if (req.query) mongoSanitize.sanitize(req.query);
    if (req.headers) mongoSanitize.sanitize(req.headers);
    next();
});

// Middleware para parsear JSON (debe ir antes del rate-limiter si inspecciona el body, pero aquí está bien)
app.use(express.json());

// Seguridad: Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 150, // Límite de 150 peticiones por IP por ventana
    message: { error: 'Demasiadas peticiones desde esta IP, intenta nuevamente después de 15 minutos.' }
});

const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // Límite de 10 intentos
    message: { error: 'Demasiados intentos de inicio de sesión o registro.' }
});

// Aplicar rate limits a las rutas
app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// Configuración de CORS
const allowedOrigins = [
  "http://localhost",
  "http://127.0.0.1",
  "http://[::1]",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://programacioniv.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Logs de peticiones HTTP con Morgan + Winston
app.use(httpLogger);

// Endpoint de Healthcheck (muy importante para contenedores/orquestadores)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Rutas de la API
app.use('/products', productsRoutes);
app.use('/users', usersRoutes);
app.use('/sales', salesRoutes);
app.use('/api', salesRoutes);
app.use('/carts', cartsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/categories', categoriesRoutes);

// Manejo Global de Errores (Error Handler)
// Atrapa cualquier error no controlado y evita que crashee la app de Express
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message} - Path: ${req.originalUrl} - Method: ${req.method} - IP: ${req.ip}`);
    
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor.' 
            : err.message
    });
});

module.exports = app;