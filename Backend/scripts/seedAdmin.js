const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/user.model');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a la base de datos');

        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Ya existe un administrador en la base de datos.');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const newAdmin = new User({
            name: 'Admin Base',
            email: 'admin@admin.com',
            password: hashedPassword,
            role: 'admin'
        });

        await newAdmin.save();
        console.log('Administrador base creado con éxito. Email: admin@admin.com / Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error al crear el admin base:', error);
        process.exit(1);
    }
};

seedAdmin();
