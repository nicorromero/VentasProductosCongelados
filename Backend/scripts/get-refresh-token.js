'use strict';

/**
 * get-refresh-token.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Script auxiliar para generar tu GOOGLE_REFRESH_TOKEN en 1 minuto cuando
 * Google Cloud bloquea la creación de Service Account Keys (JSON).
 *
 * Instrucciones:
 * 1. En Google Cloud Console:
 *    - Ve a "APIs y servicios" > "Pantalla de consentimiento de OAuth".
 *      - Selecciona "Externa", pon un nombre (ej. Ventas), tu correo y guarda.
 *      - En "Usuarios de prueba" (Test users), agrega tu propio correo de Gmail/Google.
 *    - Ve a "APIs y servicios" > "Credenciales" > "+ Crear credenciales" > "ID de cliente de OAuth".
 *      - Tipo de aplicación: "App de escritorio" (Desktop app).
 *      - Guarda y copia tu CLIENT ID y CLIENT SECRET.
 * 2. Ejecuta este script pasando tu Client ID y Secret:
 *    node scripts/get-refresh-token.js <CLIENT_ID> <CLIENT_SECRET>
 * ──────────────────────────────────────────────────────────────────────────────
 */

const http = require('http');
const url = require('url');
const { google } = require('googleapis');

const clientId = process.argv[2] || process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.argv[3] || process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    console.error('\n❌ Faltan argumentos.');
    console.error('Uso: node scripts/get-refresh-token.js <CLIENT_ID> <CLIENT_SECRET>\n');
    process.exit(1);
}

const REDIRECT_URI = 'http://localhost:3333/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/spreadsheets']
});

console.log('\n=============================================================');
console.log('🔗 ABRE EL SIGUIENTE ENLACE EN TU NAVEGADOR PARA AUTORIZAR:');
console.log('=============================================================\n');
console.log(authUrl);
console.log('\nEsperando autorización en el navegador en http://localhost:3333 ...\n');

const server = http.createServer(async (req, res) => {
    try {
        const parsedUrl = url.parse(req.url, true);
        if (parsedUrl.pathname === '/oauth2callback') {
            const code = parsedUrl.query.code;
            if (code) {
                const { tokens } = await oauth2Client.getToken(code);
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>✅ ¡Autorización Exitosa!</h1><p>Ya puedes volver a la terminal de tu proyecto.</p>');

                console.log('=============================================================');
                console.log('🎉 ¡REFRESH TOKEN GENERADO CON ÉXITO!');
                console.log('=============================================================\n');
                console.log('Copia estos valores en tu archivo Backend/.env :\n');
                console.log(`GOOGLE_CLIENT_ID=${clientId}`);
                console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
                console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
                console.log('=============================================================\n');

                server.close();
                process.exit(0);
            }
        }
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error obteniendo el token: ${err.message}`);
        console.error('❌ Error intercambiando código por token:', err.message);
        server.close();
        process.exit(1);
    }
});

server.listen(3333);
