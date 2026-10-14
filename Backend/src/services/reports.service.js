'use strict';

const ExcelJS = require('exceljs');
const Sale    = require('../models/sale.model');

/**
 * Genera un workbook de ExcelJS con dos hojas:
 *  - "Pedidos": detalle de cada orden del período
 *  - "Resumen": totales agrupados por día y por medio de pago
 *
 * @param {Date} desde  - Fecha de inicio (inclusive)
 * @param {Date} hasta  - Fecha de fin (inclusive)
 * @returns {Promise<ExcelJS.Workbook>}
 */
async function generarReporteVentas(desde, hasta) {
    // Traer pedidos del período con datos de usuario y producto
    const pedidos = await Sale.find({
        date: { $gte: desde, $lte: hasta }
    })
        .populate('user', 'name email')
        .populate('items.product', 'name')
        .sort({ date: 1 })
        .lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator  = 'VentasProductosCongelados';
    workbook.created  = new Date();

    _agregarHojaPedidos(workbook, pedidos);
    _agregarHojaResumen(workbook, pedidos);

    return workbook;
}

// ─── Hoja 1: Detalle de Pedidos ──────────────────────────────────────────────

function _agregarHojaPedidos(workbook, pedidos) {
    const hoja = workbook.addWorksheet('Pedidos');

    // Encabezados
    hoja.columns = [
        { header: 'N° Orden',       key: 'numeroOrden',   width: 16 },
        { header: 'Fecha',          key: 'fecha',         width: 20 },
        { header: 'Cliente',        key: 'cliente',       width: 28 },
        { header: 'Email',          key: 'email',         width: 32 },
        { header: 'Producto',       key: 'producto',      width: 30 },
        { header: 'Cantidad',       key: 'cantidad',      width: 12 },
        { header: 'Precio Unit.',   key: 'precioUnit',    width: 14 },
        { header: 'Subtotal',       key: 'subtotal',      width: 14 },
        { header: 'Total Orden',    key: 'totalOrden',    width: 14 },
        { header: 'Medio de Pago',  key: 'medioPago',     width: 18 },
        { header: 'Entrega',        key: 'metodoEntrega', width: 14 },
        { header: 'Estado',         key: 'estado',        width: 14 },
    ];

    // Estilo de encabezado
    const filaEncabezado = hoja.getRow(1);
    filaEncabezado.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
    filaEncabezado.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2B5F8C' } };
    filaEncabezado.alignment = { vertical: 'middle', horizontal: 'center' };
    filaEncabezado.height    = 22;

    // Filas de datos
    for (const pedido of pedidos) {
        const cliente = pedido.user?.name  || pedido.facturacion?.nombreCompleto || 'Invitado';
        const email   = pedido.user?.email || '—';

        // Una fila por cada ítem del pedido
        for (const item of pedido.items) {
            hoja.addRow({
                numeroOrden:   pedido.numeroOrden || '—',
                fecha:         _formatearFecha(pedido.date),
                cliente,
                email,
                producto:      item.product?.name || '(producto eliminado)',
                cantidad:      item.quantity,
                precioUnit:    item.price,
                subtotal:      item.subtotal,
                totalOrden:    pedido.total,
                medioPago:     pedido.medioPago     || '—',
                metodoEntrega: pedido.metodoEntrega || '—',
                estado:        pedido.estado        || pedido.status || '—',
            });
        }
    }

    // Formato moneda en columnas numéricas
    ['precioUnit', 'subtotal', 'totalOrden'].forEach((key) => {
        const col = hoja.getColumn(key);
        col.numFmt = '"$"#,##0.00';
    });

    // Bordes en todas las celdas con datos
    _aplicarBordes(hoja);
}

// ─── Hoja 2: Resumen financiero ───────────────────────────────────────────────

function _agregarHojaResumen(workbook, pedidos) {
    const hoja = workbook.addWorksheet('Resumen');

    // ── Bloque 1: Totales por día ─────────────────────────────────────────────
    const porDia = new Map();
    for (const pedido of pedidos) {
        const dia = _formatearFecha(pedido.date).split(' ')[0]; // solo la fecha
        const acumulado = porDia.get(dia) || { cantidad: 0, total: 0 };
        acumulado.cantidad += 1;
        acumulado.total    += pedido.total;
        porDia.set(dia, acumulado);
    }

    hoja.addRow(['TOTALES POR DÍA']);
    _estilizarTitulo(hoja.getRow(hoja.lastRow.number));

    hoja.addRow(['Fecha', 'Cantidad de Pedidos', 'Total Recaudado']);
    _estilizarEncabezadoSeccion(hoja.getRow(hoja.lastRow.number));

    for (const [dia, datos] of porDia) {
        hoja.addRow([dia, datos.cantidad, datos.total]);
    }

    // Fila de subtotal
    const subtotalRow = hoja.addRow(['SUBTOTAL', pedidos.length, pedidos.reduce((s, p) => s + p.total, 0)]);
    subtotalRow.font = { bold: true };

    hoja.addRow([]); // separador

    // ── Bloque 2: Totales por medio de pago ──────────────────────────────────
    const porMedioPago = {};
    for (const pedido of pedidos) {
        const medio = pedido.medioPago || 'no especificado';
        if (!porMedioPago[medio]) porMedioPago[medio] = { cantidad: 0, total: 0 };
        porMedioPago[medio].cantidad += 1;
        porMedioPago[medio].total    += pedido.total;
    }

    hoja.addRow(['TOTALES POR MEDIO DE PAGO']);
    _estilizarTitulo(hoja.getRow(hoja.lastRow.number));

    hoja.addRow(['Medio de Pago', 'Cantidad de Pedidos', 'Total Recaudado']);
    _estilizarEncabezadoSeccion(hoja.getRow(hoja.lastRow.number));

    for (const [medio, datos] of Object.entries(porMedioPago)) {
        hoja.addRow([medio, datos.cantidad, datos.total]);
    }

    // ── Bloque 3: Totales por método de entrega ───────────────────────────────
    hoja.addRow([]);

    const porEntrega = {};
    for (const pedido of pedidos) {
        const entrega = pedido.metodoEntrega || 'no especificado';
        if (!porEntrega[entrega]) porEntrega[entrega] = { cantidad: 0, total: 0 };
        porEntrega[entrega].cantidad += 1;
        porEntrega[entrega].total    += pedido.total;
    }

    hoja.addRow(['TOTALES POR MÉTODO DE ENTREGA']);
    _estilizarTitulo(hoja.getRow(hoja.lastRow.number));

    hoja.addRow(['Método de Entrega', 'Cantidad de Pedidos', 'Total Recaudado']);
    _estilizarEncabezadoSeccion(hoja.getRow(hoja.lastRow.number));

    for (const [entrega, datos] of Object.entries(porEntrega)) {
        hoja.addRow([entrega, datos.cantidad, datos.total]);
    }

    // Ancho de columnas del resumen
    hoja.getColumn(1).width = 30;
    hoja.getColumn(2).width = 22;
    hoja.getColumn(3).width = 20;

    // Formato moneda en columna 3
    hoja.getColumn(3).numFmt = '"$"#,##0.00';
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

function _formatearFecha(date) {
    const d = new Date(date);
    return d.toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year:     'numeric',
        month:    '2-digit',
        day:      '2-digit',
        hour:     '2-digit',
        minute:   '2-digit',
    });
}

function _estilizarTitulo(row) {
    row.font      = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    row.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A5C' } };
    row.height    = 20;
}

function _estilizarEncabezadoSeccion(row) {
    row.font      = { bold: true, color: { argb: 'FF000000' } };
    row.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
    row.height    = 18;
}

function _aplicarBordes(hoja) {
    const borde = { style: 'thin', color: { argb: 'FFCCCCCC' } };
    hoja.eachRow((row) => {
        row.eachCell((cell) => {
            cell.border = { top: borde, left: borde, bottom: borde, right: borde };
        });
    });
}

module.exports = { generarReporteVentas };
