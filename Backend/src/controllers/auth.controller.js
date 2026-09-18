const crypto = require('crypto');
const jwt    = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User   = require('../models/user.model');
const { sendPasswordResetEmail } = require('../config/mailer');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (user.active === false) {
            return res.status(403).json({ error: 'Tu cuenta está desactivada' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const GENERIC_MSG = { message: 'Si el email existe, recibirás un link de recuperación.' };

    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email requerido' });
        }

        const user = await User.findOne({ email });

        // Respuesta genérica siempre, para no revelar si el email existe
        if (!user) {
            return res.status(200).json(GENERIC_MSG);
        }

        const resetToken  = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken   = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail(user.email, resetLink);
        } catch (mailErr) {
            console.error('Error al enviar email de recuperación:', mailErr.message);
        }

        return res.status(200).json(GENERIC_MSG);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token requerido' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken:   hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'El link de recuperación es inválido o expiró' });
        }

        user.password             = await bcrypt.hash(password, 10);
        user.resetPasswordToken   = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login, forgotPassword, resetPassword };
