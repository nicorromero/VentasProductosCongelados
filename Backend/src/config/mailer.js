const nodemailer = require('nodemailer');

function createTransporter() {
    const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'FRONTEND_URL'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
        throw new Error(`Faltan variables de entorno para el mailer: ${missing.join(', ')}`);
    }

    return nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

async function sendPasswordResetEmail(toEmail, resetLink) {
    const transporter = createTransporter();
    return transporter.sendMail({
        from:    process.env.MAIL_FROM,
        to:      toEmail,
        subject: 'Recuperación de contraseña',
        text: [
            'Recibimos una solicitud para restablecer la contraseña de tu cuenta.',
            '',
            `Ingresá al siguiente enlace para crear una nueva contraseña: ${resetLink}`,
            '',
            'El link vence en 15 minutos y es de un solo uso.',
            '',
            'Si no solicitaste esto, ignorá este mensaje.'
        ].join('\n'),
        html: `
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>
                <a href="${resetLink}" style="background:#ff1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
                    Restablecer contraseña
                </a>
            </p>
            <p>O copiá y pegá este link en tu navegador:<br/><code>${resetLink}</code></p>
            <p><strong>El link vence en 15 minutos y es de un solo uso.</strong></p>
            <p>Si no solicitaste esto, ignorá este mensaje.</p>
        `
    });
}

async function sendContactEmail({ name, email, message }) {
    const transporter = createTransporter();
    return transporter.sendMail({
        from:    process.env.MAIL_FROM,
        to:      process.env.MAIL_FROM,
        replyTo: email,
        subject: `Nuevo mensaje de contacto de ${name}`,
        html: `
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${message}</p>
        `
    });
}

module.exports = { createTransporter, sendPasswordResetEmail, sendContactEmail };
