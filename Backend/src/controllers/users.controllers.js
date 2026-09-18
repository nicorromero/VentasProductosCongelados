const bcrypt = require('bcrypt');
const User = require('../models/user.model');

//clase conectada a mongo

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ active: { $ne: false } }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User no encontrado' });
        }
        res.json(user);
    } catch (error) {
        if(error.name === 'CastError'){
            res.status(400).json({error:"ID obligatorio inválido"})
            return
        }
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};

const createUser = async (req, res) => {
    try {
        const { password, ...rest } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const nuevoUser = new User({ ...rest, password: hashedPassword });
        await nuevoUser.save();
        res.json(nuevoUser);
    } catch (error) {
        if(error.code === 11000){
            res.status(409).json({error: "El correo electrónico ya se encuentra registrado"})
            return
        }
        if(error.name === 'ValidationError'){
            res.status(400).json({error:"Datos obligatorios inválidos"})
            return
        }
        res.status(500).json({ error: 'Error al crear el usuario' });       
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'User no encontrado' });
        }
        res.json({ message: 'Usuario dado de baja', user });
    } catch (error) {
        if(error.name === 'CastError'){
            res.status(400).json({error:"ID obligatorio inválido"})
            return
        }
        res.status(500).json({ error: 'Error al dar de baja el usuario' });
    }
};

const getInactiveUsers = async (req, res) => {
    try {
        const users = await User.find({ active: false }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios inactivos' });
    }
};

const reactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { active: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'User no encontrado' });
        }
        res.json({ message: 'Usuario reactivado', user });
    } catch (error) {
        if(error.name === 'CastError'){
            res.status(400).json({error:"ID obligatorio inválido"})
            return
        }
        res.status(500).json({ error: 'Error al reactivar el usuario' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.usuario.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};

const updateUserById = async (req, res) => {
    try {
        const { password, currentPassword, ...rest } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User no encontrado' });
        }

        if (password) {
            // Si es el propio usuario cambiando su contraseña, verificar la actual
            const isSelf = req.usuario?.id === req.params.id;
            if (isSelf) {
                if (!currentPassword) {
                    return res.status(400).json({ error: 'Ingresá tu contraseña actual' });
                }
                const match = await bcrypt.compare(currentPassword, user.password);
                if (!match) {
                    return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
                }
            }
            rest.password = await bcrypt.hash(password, 10);
        }

        Object.assign(user, rest);
        await user.save();

        res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        if(error.code === 11000){
            res.status(409).json({error: "El correo electrónico ya se encuentra registrado"})
            return
        }
        if(error.name === 'ValidationError'){
            res.status(400).json({error:"Datos obligatorios inválidos"})
            return
        }
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
};


module.exports = {
    getUsers,
    getUserById,
    getMe,
    createUser,
    deleteUser,
    updateUserById,
    getInactiveUsers,
    reactivateUser
};

