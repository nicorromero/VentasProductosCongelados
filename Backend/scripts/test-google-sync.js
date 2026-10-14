'use strict';

/**
 * test-google-sync.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Script de diagnóstico y verificación integral de conexión con Google Sheets.
 * Ejecutar con: node scripts/test-google-sync.js
 * ──────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const { google } = require('googleapis');

async function testConnection() {
    console.log('\n=============================================================');
    console.log('🔍 INICIANDO DIAGNÓSTICO DE CONEXIÓN CON GOOGLE SHEETS');
    console.log('=============================================================\n');

    const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.replace(/"/g, '').trim();
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
        ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim()
        : null;

    // 1. Validar variables en .env
    console.log('1️⃣  Verificando variables de entorno en Backend/.env...');

    if (!sheetId) {
        console.error('❌ Falta GOOGLE_SHEET_ID en tu archivo .env.');
        console.error('👉 Abre tu Google Sheet en el navegador y copia el ID que está en la URL:');
        console.error('   https://docs.google.com/spreadsheets/d/AQUÍ_ESTA_EL_ID/edit\n');
        process.exit(1);
    }
    console.log(`   ✔ GOOGLE_SHEET_ID detectado: ${sheetId}`);

    if (!email || !privateKey) {
        console.error('❌ Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_PRIVATE_KEY en .env');
        process.exit(1);
    }
    console.log(`   ✔ Service Account Email: ${email}`);
    console.log(`   ✔ Private Key: [OK, ${privateKey.length} caracteres]`);

    // 2. Probar autenticación JWT
    console.log('\n2️⃣  Autenticando con Google Cloud IAM...');
    let sheets;
    try {
        const auth = new google.auth.JWT({
            email,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        await auth.authorize();
        sheets = google.sheets({ version: 'v4', auth });
        console.log('   ✔ Token de acceso generado correctamente con Google Cloud.');
    } catch (err) {
        console.error('❌ Error de autenticación con Google Cloud:');
        console.error(`   ${err.message}`);
        console.error('\n👉 Verifica que la clave privada y el correo coincidan con el archivo JSON descargado.');
        process.exit(1);
    }

    // 3. Probar acceso a la planilla en Drive
    console.log('\n3️⃣  Accediendo al Google Sheet en Google Drive...');
    let metadata;
    try {
        const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        metadata = res.data;
        console.log(`   ✔ Planilla conectada con éxito: "${metadata.properties.title}"`);
    } catch (err) {
        const status = err.status || err.code || err.response?.status;
        console.error(`❌ Error al acceder a la planilla (Código HTTP ${status}):`);
        if (status === 403) {
            console.error('\n🚨 ¡PERMISO DENEGADO! (Falta compartir el archivo)');
            console.error('👉 Solución en 3 clics:');
            console.error('   1. Abre tu Google Sheet en el navegador.');
            console.error('   2. Haz clic en el botón verde "Compartir" (Share).');
            console.error(`   3. Pega este correo: ${email}`);
            console.error('   4. Asígnale el rol de "Editor" y haz clic en Compartir.\n');
        } else if (status === 404) {
            console.error(`\n🚨 ¡PLANILLA NO ENCONTRADA! El ID "${sheetId}" no existe.`);
            console.error('👉 Revisa la URL de tu Google Sheet y asegúrate de haber copiado solo el ID.\n');
        } else {
            console.error(`   ${err.message}\n`);
        }
        process.exit(1);
    }

    // 4. Verificar hojas requeridas
    console.log('\n4️⃣  Verificando existencia de hojas requeridas...');
    const hojas = metadata.sheets.map(s => s.properties.title);
    console.log(`   Hojas detectadas: [ ${hojas.join(', ')} ]`);

    const tienePresupuesto = hojas.includes('Presupuesto');
    const tieneDelivery = hojas.includes('Delivery');

    if (!tienePresupuesto) {
        console.warn('   ⚠️ Advertencia: No se encontró la hoja "Presupuesto". (Verifica que el nombre sea exacto).');
    } else {
        console.log('   ✔ Hoja "Presupuesto" encontrada.');
    }

    if (!tieneDelivery) {
        console.warn('   ⚠️ Advertencia: No se encontró la hoja "Delivery". (Verifica que el nombre sea exacto).');
    } else {
        console.log('   ✔ Hoja "Delivery" encontrada.');
    }

    // 5. Prueba de lectura de datos
    console.log('\n5️⃣  Probando lectura de datos en hoja "Delivery"...');
    try {
        const resDelivery = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Delivery!C7:O12',
            valueRenderOption: 'UNFORMATTED_VALUE'
        });
        const rows = resDelivery.data.values || [];
        console.log(`   ✔ Lectura exitosa: se leyeron ${rows.length} filas de muestra.`);
        if (rows.length > 0) {
            console.log(`   Ejemplo fila 1 -> Producto: "${rows[0][0]}", Precio Venta Apps (Col O): ${rows[0][12] || rows[0][1] || 'Sin valor'}`);
        }
    } catch (err) {
        console.warn(`   ⚠️ No se pudo leer el rango de Delivery: ${err.message}`);
    }

    console.log('\n=============================================================');
    console.log('🎉 ¡DIAGNÓSTICO FINALIZADO CON ÉXITO! LA SINCRONIZACIÓN ESTÁ LISTA.');
    console.log('=============================================================\n');
}

testConnection();
