'use strict';

const cron                              = require('node-cron');
const { generarReporteVentas }          = require('../services/reports.service');
const { enviarReporteVentas }           = require('../services/mailer.service');
const { logger }                        = require('../middlewares/logger.middleware');

// Zona horaria Argentina
const TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Ejecuta el reporte del día anterior y lo envía por email.
 * Diseñado para correr a las 23:59 todos los días.
 */
async function ejecutarReporteDiario() {
    const ahora  = new Date();
    const hoy    = new Date(ahora.toLocaleString('en-US', { timeZone: TIMEZONE }));

    // Rango: 00:00:00 a 23:59:59 del día actual (hora Argentina)
    const desde  = new Date(hoy);
    desde.setHours(0, 0, 0, 0);

    const hasta  = new Date(hoy);
    hasta.setHours(23, 59, 59, 999);

    const periodo = hoy.toLocaleDateString('es-AR', { timeZone: TIMEZONE });

    logger.info(`[ReportsJob] Iniciando reporte diario para el período: ${periodo}`);

    try {
        const workbook = await generarReporteVentas(desde, hasta);
        await enviarReporteVentas(workbook, periodo);
        logger.info(`[ReportsJob] Reporte del ${periodo} enviado correctamente.`);
    } catch (error) {
        // Solo loguea el error — nunca crashea el proceso
        logger.error(`[ReportsJob] Error al generar/enviar el reporte del ${periodo}: ${error.message}`);
    }
}

/**
 * Registra el cron job. Llamar una sola vez desde server.js.
 *
 * Horario por defecto: todos los días a las 23:59 (hora Argentina).
 * Sobreescribible via variable de entorno REPORT_CRON_SCHEDULE.
 * Formato: minuto hora día mes día-semana
 * Ejemplo: "0 8 * * 1" = todos los lunes a las 08:00
 */
function iniciarReportsJob() {
    const schedule = process.env.REPORT_CRON_SCHEDULE || '59 23 * * *';

    if (!cron.validate(schedule)) {
        logger.error(`[ReportsJob] El cron schedule "${schedule}" es inválido. El job NO fue registrado.`);
        return;
    }

    cron.schedule(schedule, ejecutarReporteDiario, {
        scheduled: true,
        timezone:  TIMEZONE,
    });

    logger.info(`[ReportsJob] Cron registrado con schedule: "${schedule}" (TZ: ${TIMEZONE})`);
}

module.exports = { iniciarReportsJob, ejecutarReporteDiario };
