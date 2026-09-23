const Product = require('../models/product.model');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, active: true });
        if (!product) {
            res.status(404).json({ error: 'El producto no se encontró' });
            return;
        }
        res.json(product);
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({ error: 'ID de producto inválido' });
            return;
        }
        res.status(500).json({ message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'El producto ya existe' });
            return;
        }
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: 'Datos obligatorios no válidos' });
            return;
        }
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json({ message: 'Producto eliminado permanentemente' });
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({ error: 'ID de producto inválido' });
            return;
        }
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json(product);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: 'Datos obligatorios no válidos' });
            return;
        }
        if (error.name === 'CastError') {
            res.status(400).json({ error: 'ID de producto inválido' });
            return;
        }
        res.status(500).json({ message: error.message });
    }
};

const toggleActive = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        product.active = !product.active;
        await product.save();
        res.json(product);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'ID de producto inválido' });
        }
        res.status(500).json({ message: error.message });
    }
};

const getInactiveProducts = async (req, res) => {
    try {
        const products = await Product.find({ active: false });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reactivateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { active: true },
            { new: true }
        );
        if (!product) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json({ message: 'Producto reactivado', product });
    } catch (error) {
        if (error.name === 'CastError') {
            res.status(400).json({ error: 'ID de producto inválido' });
            return;
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    updateProduct,
    toggleActive,
    getInactiveProducts,
    reactivateProduct
};
