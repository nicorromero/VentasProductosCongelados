const Category = require('../models/category.model');

// Seedear categorías iniciales si no existen
const seedCategories = async () => {
    const defaults = ['Pizzas', 'Milanesas', 'Tarteletas'];
    for (const name of defaults) {
        await Category.findOneAndUpdate(
            { name },
            { name },
            { upsert: true, new: true }
        );
    }
};
seedCategories().catch(console.error);

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }
        const category = await Category.create({ name: name.trim() });
        res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Esa categoría ya existe' });
        }
        res.status(500).json({ error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.json({ message: 'Categoría eliminada', category });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'ID inválido' });
        }
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getCategories, createCategory, deleteCategory };
