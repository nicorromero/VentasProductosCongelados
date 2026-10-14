'use strict';

/**
 * excelSyncJob.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Cron Jobs para la sincronización automatizada entre MongoDB y el Excel:
 *
 * 1. Cierre de Caja Diario (Sincronización Inversa):
 *    - Se ejecuta a las 23:59 todos los días (hora de Argentina).
 *    - Agrupa las ventas del día y las inyecta en la hoja "Presupuesto".
 *
 * 2. Lectura Periódica de Precios Sugeridos (Sincronización Frontal):
 *    - Se ejecuta periódicamente (por defecto a las 06:00 y configurable).
 *    - Lee los precios calculados de la hoja "Delivery" y actualiza `suggestedPrice`.
 *
 * Ubicación: Backend/src/jobs/excelSyncJob.js
 * ──────────────────────────────────────────────────────────────────────────────
 */

const cron = require('node-cron');
const {
    escribirVentasEnExcel,
    leerPreciosSugeridos
} = require('../services/excelSync.service');
const { logger } = require('../middlewares/logger.middleware');

// Zona horaria de operación (Argentina)
const TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Ejecuta el cierre de caja del día actual (00:00:00 a 23:59:59)
 * e inyecta las cantidades vendidas en la hoja "Presupuesto" del Excel.
 */
async function ejecutarCierreCajaDiario() {
    const ahora = new Date();
    const hoyStr = ahora.toLocaleDateString('es-AR', { timeZone: TIMEZONE });

    // Rango horario del día actual en zona horaria Argentina
    const inicioDia = new Date(ahora.toLocaleString('en-US', { timeZone: TIMEZONE }));
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(ahora.toLocaleString('en-US', { timeZone: TIMEZONE }));
    finDia.setHours(23, 59, 59, 999);

    logger.info(`[ExcelSyncJob] Iniciando Cierre de Caja del día: ${hoyStr}`);

    try {
        const resultado = await escribirVentasEnExcel(inicioDia, finDia);
        logger.info(
            `[ExcelSyncJob] Cierre de caja completado para ${hoyStr}. ` +
            `${resultado.productosActualizados} productos con ventas reflejados en el Excel.`
        );
    } catch (error) {
        // Loguea el error detalladamente — NUNCA detiene ni crashea el proceso
        logger.error(`[ExcelSyncJob] Error durante el cierre de caja del ${hoyStr}: ${error.message}`);
    }
}

/**
 * Ejecuta la lectura de precios finales desde la hoja "Delivery" del Excel
 * y actualiza el campo `suggestedPrice` en MongoDB.
 */
async function ejecutarSincronizacionPrecios() {
    logger.info('[ExcelSyncJob] Iniciando lectura de precios sugeridos desde el Excel...');

    try {
        const resultado = await leerPreciosSugeridos();
        logger.info(
            `[ExcelSyncJob] Precios sugeridos sincronizados. ` +
            `${resultado.actualizados} producto(s) actualizados con nuevas sugerencias.`
        );
    } catch (error) {
        logger.error(`[ExcelSyncJob] Error al sincronizar precios sugeridos desde el Excel: ${error.message}`);
    }
}

/**
 * Registra y activa los dos cron jobs de sincronización con el Excel.
 * Debe invocarse una sola vez al inicializar el servidor (en server.js).
 */
function iniciarExcelSyncJobs() {
    // 1. Cron de Cierre de Caja (por defecto: 23:59 todos los días)
    const scheduleCierre = process.env.EXCEL_CIERRE_CRON_SCHEDULE || '59 23 * * *';

    if (cron.validate(scheduleCierre)) {
        cron.schedule(scheduleCierre, ejecutarCierreCajaDiario, {
            scheduled: true,
            timezone: TIMEZONE
        });
        logger.info(`[ExcelSyncJob] Cron de Cierre de Caja programado: "${scheduleCierre}" (TZ: ${TIMEZONE})`);
    } else {
        logger.error(`[ExcelSyncJob] El cron schedule de cierre "${scheduleCierre}" es inválido. No se registró.`);
    }

    // 2. Cron de Lectura de Precios Sugeridos (por defecto: todos los días a las 06:00)
    const schedulePrecios = process.env.EXCEL_PRECIOS_CRON_SCHEDULE || '0 6 * * *';

    if (cron.validate(schedulePrecios)) {
        cron.schedule(schedulePrecios, ejecutarSincronizacionPrecios, {
            scheduled: true,
            timezone: TIMEZONE
        });
        logger.info(`[ExcelSyncJob] Cron de Precios Sugeridos programado: "${schedulePrecios}" (TZ: ${TIMEZONE})`);
    } else {
        logger.error(`[ExcelSyncJob] El cron schedule de precios "${schedulePrecios}" es inválido. No se registró.`);
    }
}

module.exports = {
    iniciarExcelSyncJobs,
    ejecutarCierreCajaDiario,
    ejecutarSincronizacionPrecios
};
