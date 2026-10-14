'use strict';

const { createTransporter } = require('../config/mailer');

/**
 * Envía el reporte de ventas como adjunto .xlsx por email.
 *
 * @param {ExcelJS.Workbook} workbook  - Workbook generado por reports.service.js
 * @param {string}           periodo   - Descripción del período (ej. "14/10/2026")
 */
async function enviarReporteVentas(workbook, periodo) {
    const destinatario = process.env.REPORT_EMAIL || process.env.MAIL_FROM;

    if (!destinatario) {
        throw new Error('No hay destinatario configurado para el reporte. Definí REPORT_EMAIL en .env');
    }

    // Serializar el workbook a buffer para adjuntarlo sin escribir en disco
    const buffer = await workbook.xlsx.writeBuffer();

    const transporter = createTransporter();

    await transporter.sendMail({
        from:    process.env.MAIL_FROM,
        to:      destinatario,
        subject: `Reporte de Ventas — ${periodo}`,
        text:    `Adjunto encontrás el reporte de ventas correspondiente al período: ${periodo}.`,
        html: `
            <p>Hola,</p>
            <p>Adjunto encontrás el reporte de ventas del período <strong>${periodo}</strong>.</p>
            <p style="color:#666;font-size:12px;">Este email fue generado automáticamente por el sistema.</p>
        `,
        attachments: [
            {
                filename:    `reporte-ventas-${periodo.replace(/\//g, '-')}.xlsx`,
                content:     buffer,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        ],
    });
}

module.exports = { enviarReporteVentas };
