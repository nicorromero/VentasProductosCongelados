'use strict';

const { generarReporteVentas } = require('../services/reports.service');
const { enviarReporteVentas }  = require('../services/mailer.service');
const { logger }               = require('../middlewares/logger.middleware');

/**
 * POST /api/reports/ventas/export
 * Disparo manual del reporte. Solo accesible por admin.
 * Acepta opcionalmente { desde, hasta } en el body (ISO 8601).
 * Si no se pasan, usa el día actual (hora Argentina).
 */
const exportarReporteVentas = async (req, res) => {
    const TIMEZONE = 'America/Argentina/Buenos_Aires';

    try {
        // Calcular rango
        let desde, hasta;

        if (req.body.desde && req.body.hasta) {
            desde = new Date(req.body.desde);
            hasta = new Date(req.body.hasta);

            if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
                return res.status(400).json({ error: 'Las fechas "desde" y "hasta" son inválidas.' });
            }
            if (desde > hasta) {
                return res.status(400).json({ error: 'La fecha "desde" no puede ser mayor a "hasta".' });
            }
        } else {
            // Por defecto: día actual completo en zona horaria Argentina
            const ahora = new Date();
            const hoy   = new Date(ahora.toLocaleString('en-US', { timeZone: TIMEZONE }));
            desde       = new Date(hoy.setHours(0, 0, 0, 0));
            hasta       = new Date(new Date(ahora.toLocaleString('en-US', { timeZone: TIMEZONE })).setHours(23, 59, 59, 999));
        }

        const periodo  = `${desde.toLocaleDateString('es-AR')} al ${hasta.toLocaleDateString('es-AR')}`;

        logger.info(`[ReportsController] Reporte manual solicitado por admin ${req.usuario?.id} — período: ${periodo}`);

        const workbook = await generarReporteVentas(desde, hasta);
        await enviarReporteVentas(workbook, periodo);

        res.status(200).json({
            message: `Reporte enviado correctamente al email configurado.`,
            periodo,
        });
    } catch (error) {
        logger.error(`[ReportsController] Error al generar reporte manual: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { exportarReporteVentas };
