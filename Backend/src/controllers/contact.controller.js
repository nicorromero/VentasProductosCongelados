const { sendContactEmail } = require('../config/mailer');

const sendMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
        }

        await sendContactEmail({ name, email, message });

        res.status(200).json({ message: 'Mensaje enviado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { sendMessage };
