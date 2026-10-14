'use strict';

/**
 * excelSync.service.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Servicio de sincronización bidireccional en la Nube mediante Google Sheets API v4.
 *
 * Conecta directamente el e-commerce de MongoDB con el Google Sheet en Drive:
 *
 * 1. TAREA 1 (Sincronización Inversa - Cierre de Caja):
 *    - Agrupa las cantidades vendidas por producto desde `sale.model.js`.
 *    - Consulta los nombres en la hoja "Presupuesto" (Columna C: PRODUCTO).
 *    - Escribe las cantidades vendidas mediante `values.batchUpdate` en la
 *      columna F ("CANTIDAD VENDIDA") para que las fórmulas recalculen la utilidad.
 *
 * 2. TAREA 2 (Sincronización Frontal - Sugerencia de Precios):
 *    - Consulta la hoja "Delivery" mediante `values.get` (Columna C: PRODUCTO,
 *      Columna O: PRECIO VENTA APPS).
 *    - Actualiza el campo `suggestedPrice` en MongoDB sin alterar el `price` oficial.
 *
 * 3. RESILIENCIA Y MANEJO DE CUOTAS:
 *    - Reintentos exponenciales automáticos ante errores transitorios (429, 500, 503).
 *    - Nunca crashea el proceso de Node.js ante desconexión o falta de permisos.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const { google } = require('googleapis');
const Sale       = require('../models/sale.model');
const Product    = require('../models/product.model');
const { logger } = require('../middlewares/logger.middleware');

const TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Inicializa y retorna el cliente autenticado de Google Sheets v4.
 * Soporta variables segregadas de Service Account, archivo JSON o string JSON.
 *
 * @returns {{ sheets: import('googleapis').sheets_v4.Sheets, spreadsheetId: string }}
 */
function getGoogleSheetsClient() {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
        throw new Error('[GoogleSheetsSync] GOOGLE_SHEET_ID no está configurado en las variables de entorno.');
    }

    let auth;

    // Opción 1: OAuth2 con Client ID + Secret + Refresh Token (ideal si la política de la organización bloquea Service Account Keys)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID.trim(),
            process.env.GOOGLE_CLIENT_SECRET.trim()
        );
        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim()
        });
        auth = oauth2Client;
    }
    // Opción 2 (Recomendada Cloud): Email y Clave Privada de Service Account segregados
    else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim();
        const privateKey = process.env.GOOGLE_PRIVATE_KEY
            .replace(/\\n/g, '\n')
            .replace(/^"|"$/g, '')
            .trim();

        auth = new google.auth.JWT({
            email,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
    }
    // Opción 3: String JSON completo en variable de entorno
    else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
            auth = new google.auth.JWT({
                email: credentials.client_email,
                key: credentials.private_key,
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });
        } catch (err) {
            throw new Error(`[GoogleSheetsSync] GOOGLE_SERVICE_ACCOUNT_KEY no es un JSON válido: ${err.message}`);
        }
    }
    // Opción 4: Ruta a archivo JSON de credenciales
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
    } else {
        throw new Error(
            '[GoogleSheetsSync] Credenciales de Google Cloud ausentes. ' +
            'Configure GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_PRIVATE_KEY (o GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REFRESH_TOKEN).'
        );
    }

    const sheets = google.sheets({ version: 'v4', auth });
    return { sheets, spreadsheetId };
}

/**
 * Envoltorio de resiliencia con Exponential Backoff para llamadas a la API de Google Sheets.
 * Reintenta automáticamente ante errores transitorios (429 Too Many Requests, 500, 503 o timeouts).
 *
 * @template T
 * @param {() => Promise<T>} operacion
 * @param {number} maxReintentos
 * @param {number} esperaBaseMs
 * @returns {Promise<T>}
 */
async function ejecutarConReintento(operacion, maxReintentos = 3, esperaBaseMs = 1000) {
    let intento = 0;
    while (intento < maxReintentos) {
        try {
            return await operacion();
        } catch (error) {
            intento++;
            const status = error.status || error.code || error.response?.status;
            const esTransitorio = status === 429 || status === 500 || status === 502 || status === 503 ||
                error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT';

            if (!esTransitorio || intento >= maxReintentos) {
                // Mensajes de diagnóstico amigables para errores comunes de Google API
                if (status === 403) {
                    logger.error(
                        '[GoogleSheetsSync] Error 403 (Permiso denegado): ' +
                        'Asegúrese de compartir la planilla de Google Sheets con el correo de la Service Account otorgándole permisos de Editor.'
                    );
                } else if (status === 404) {
                    logger.error(
                        `[GoogleSheetsSync] Error 404 (No encontrado): ` +
                        `No se encontró la planilla con el ID "${process.env.GOOGLE_SHEET_ID}". Verifique GOOGLE_SHEET_ID.`
                    );
                }
                throw error;
            }

            const demora = esperaBaseMs * Math.pow(2, intento - 1) + Math.random() * 500;
            logger.warn(
                `[GoogleSheetsSync] Llamada a Google API falló con código ${status || error.message}. ` +
                `Reintentando intento (${intento}/${maxReintentos}) en ${Math.round(demora)}ms...`
            );
            await new Promise(resolve => setTimeout(resolve, demora));
        }
    }
}

/**
 * Normaliza cadenas de texto para comparaciones de productos (ignora mayúsculas y acentos).
 *
 * @param {string} str
 * @returns {string}
 */
function normalizarTexto(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Convierte un valor de celda de Google Sheets en número seguro.
 *
 * @param {*} val
 * @returns {number|null}
 */
function parsearNumeroSheet(val) {
    if (val == null) return null;
    if (typeof val === 'number') {
        return Number.isFinite(val) ? val : null;
    }
    if (typeof val === 'string') {
        const limpio = val.replace(/[^0-9.,-]/g, '').replace(',', '.');
        const num = parseFloat(limpio);
        return (!isNaN(num) && Number.isFinite(num)) ? num : null;
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TAREA 1: Cierre de Caja (Google Sheets - Hoja "Presupuesto")
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Consulta y consolida las cantidades vendidas por producto en el rango dado.
 *
 * @param {Date} desde
 * @param {Date} hasta
 * @returns {Promise<Map<string, { nombreOriginal: string, cantidad: number, total: number }>>}
 */
async function obtenerVentasConsolidadas(desde, hasta) {
    const pedidos = await Sale.find({
        date: { $gte: desde, $lte: hasta },
        estado: { $ne: 'cancelado' }
    })
        .populate('items.product', 'name')
        .lean();

    const mapaVentas = new Map();

    for (const pedido of pedidos) {
        for (const item of pedido.items) {
            const nombreProd = item.product?.name;
            if (!nombreProd) continue;

            const clave = normalizarTexto(nombreProd);
            const actual = mapaVentas.get(clave) || { nombreOriginal: nombreProd, cantidad: 0, total: 0 };
            actual.cantidad += Number(item.quantity) || 0;
            actual.total    += Number(item.subtotal) || (Number(item.price) * Number(item.quantity)) || 0;
            mapaVentas.set(clave, actual);
        }
    }

    return mapaVentas;
}

/**
 * Escribe las cantidades consolidadas en la hoja "Presupuesto" de Google Sheets.
 *
 * Mapeo en Google Sheets:
 *  - Hoja "Presupuesto"
 *  - Columna C (3): PRODUCTO (filas desde la 3 en adelante)
 *  - Columna F (6): CANTIDAD VENDIDA
 *
 * @param {Date} desde
 * @param {Date} hasta
 * @returns {Promise<{ productosActualizados: number, totalUnidades: number, spreadsheetId: string }>}
 */
async function escribirVentasEnExcel(desde, hasta) {
    const { sheets, spreadsheetId } = getGoogleSheetsClient();

    const ventas = await obtenerVentasConsolidadas(desde, hasta);
    logger.info(`[GoogleSheetsSync] Cierre de caja: Se detectaron ventas para ${ventas.size} producto(s) en el período.`);

    // Leer la lista de productos de la Columna C en la hoja "Presupuesto" (a partir de fila 3)
    const respuestaNombres = await ejecutarConReintento(() =>
        sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Presupuesto!C3:C',
            valueRenderOption: 'FORMATTED_VALUE'
        })
    );

    const filasProductos = respuestaNombres.data.values || [];
    if (filasProductos.length === 0) {
        logger.warn('[GoogleSheetsSync] No se encontraron nombres de productos en "Presupuesto!C3:C".');
        return { productosActualizados: 0, totalUnidades: 0, spreadsheetId };
    }

    const dataUpdates = [];
    let actualizados = 0;
    let totalUnidades = 0;

    // Emparejar cada fila con las ventas del día
    for (let i = 0; i < filasProductos.length; i++) {
        const numeroFila = 3 + i;
        const nombreProductoSheet = filasProductos[i]?.[0];
        if (!nombreProductoSheet) continue;

        const clave = normalizarTexto(nombreProductoSheet);
        const venta = ventas.get(clave);

        if (venta) {
            dataUpdates.push({
                range: `Presupuesto!F${numeroFila}`,
                values: [[venta.cantidad]]
            });
            actualizados++;
            totalUnidades += venta.cantidad;
            logger.info(`[GoogleSheetsSync] Fila ${numeroFila} (${nombreProductoSheet}): inyectadas ${venta.cantidad} unidades vendidas.`);
        }
    }

    if (dataUpdates.length > 0) {
        await ejecutarConReintento(() =>
            sheets.spreadsheets.values.batchUpdate({
                spreadsheetId,
                requestBody: {
                    valueInputOption: 'USER_ENTERED', // Para que Google Sheets evalúe como número y recalcule fórmulas
                    data: dataUpdates
                }
            })
        );
        logger.info(`[GoogleSheetsSync] Cierre de caja completado en Google Sheets: ${actualizados} producto(s) actualizados (${totalUnidades} unidades).`);
    } else {
        logger.info('[GoogleSheetsSync] No hubo coincidencias de ventas para actualizar en la hoja "Presupuesto".');
    }

    return {
        productosActualizados: actualizados,
        totalUnidades,
        spreadsheetId
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// TAREA 2: Sugerencia de Precios (Google Sheets - Hoja "Delivery")
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lee los precios calculados desde la hoja "Delivery" en Google Sheets
 * y actualiza el campo `suggestedPrice` en MongoDB.
 *
 * Mapeo en Google Sheets:
 *  - Hoja "Delivery"
 *  - Rango: Delivery!C7:O
 *    - Columna C (índice 0): PRODUCTO
 *    - Columna D (índice 1): PRECIO DE VENTA (Base)
 *    - Columna O (índice 12): PRECIO VENTA APPS (Precio con costos y comisiones de delivery)
 *
 * @returns {Promise<{ actualizados: number, totalRevisados: number, spreadsheetId: string }>}
 */
async function leerPreciosSugeridos() {
    const { sheets, spreadsheetId } = getGoogleSheetsClient();

    // Traer rango de la hoja Delivery
    const respuesta = await ejecutarConReintento(() =>
        sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Delivery!C7:O',
            valueRenderOption: 'UNFORMATTED_VALUE' // Retorna números puros sin signos de moneda para mayor precisión
        })
    );

    const filas = respuesta.data.values || [];
    if (filas.length === 0) {
        logger.warn('[GoogleSheetsSync] La hoja "Delivery" no contiene datos en el rango Delivery!C7:O.');
        return { actualizados: 0, totalRevisados: 0, spreadsheetId };
    }

    // Traer productos vigentes de MongoDB
    const productosDB = await Product.find({});
    if (productosDB.length === 0) {
        logger.warn('[GoogleSheetsSync] No hay productos registrados en MongoDB.');
        return { actualizados: 0, totalRevisados: filas.length, spreadsheetId };
    }

    const mapaDB = new Map();
    for (const prod of productosDB) {
        mapaDB.set(normalizarTexto(prod.name), prod);
    }

    const ahora = new Date();
    let actualizados = 0;
    let revisados = 0;

    for (const fila of filas) {
        const nombreSheet = fila[0]; // Columna C (PRODUCTO)
        if (!nombreSheet || typeof nombreSheet !== 'string') continue;

        // Columna O (índice 12) es "PRECIO VENTA APPS". Si está vacío, fallback a Columna D (índice 1)
        const precioSugeridoRaw = parsearNumeroSheet(fila[12]) ?? parsearNumeroSheet(fila[1]);
        if (precioSugeridoRaw == null || precioSugeridoRaw <= 0) continue;

        revisados++;
        const clave = normalizarTexto(nombreSheet);
        const prod = mapaDB.get(clave);

        if (!prod) continue;

        const precioRedondeado = Math.round(precioSugeridoRaw);

        // Si el precio sugerido en Google Sheets difiere del precio vigente en la tienda
        if (precioRedondeado !== prod.price) {
            if (prod.suggestedPrice !== precioRedondeado) {
                prod.suggestedPrice = precioRedondeado;
                prod.suggestedPriceDate = ahora;
                await prod.save();
                actualizados++;
                logger.info(`[GoogleSheetsSync] Nueva sugerencia para "${prod.name}": Actual=$${prod.price} -> Google Sheets=$${precioRedondeado}`);
            }
        } else if (prod.suggestedPrice !== null) {
            // Si el precio en la hoja coincide exactamente con el precio de DB, limpiar sugerencia pendiente
            prod.suggestedPrice = null;
            prod.suggestedPriceDate = null;
            await prod.save();
        }
    }

    logger.info(`[GoogleSheetsSync] Sincronización de precios finalizada: ${actualizados} producto(s) con precio sugerido actualizado.`);

    return {
        actualizados,
        totalRevisados: revisados,
        spreadsheetId
    };
}

module.exports = {
    escribirVentasEnExcel,
    leerPreciosSugeridos,
    obtenerVentasConsolidadas,
    getGoogleSheetsClient
};
