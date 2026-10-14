'use strict';

const express  = require('express');
const router   = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const { exportarReporteVentas }          = require('../controllers/reports.controller');

// POST /api/reports/ventas/export
// Disparo manual del reporte de ventas. Solo admin.
// Body opcional: { "desde": "2026-10-01T00:00:00", "hasta": "2026-10-14T23:59:59" }
router.post('/ventas/export', authMiddleware, adminMiddleware, exportarReporteVentas);

module.exports = router;
