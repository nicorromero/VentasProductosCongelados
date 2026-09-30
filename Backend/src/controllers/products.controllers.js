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
        const body = { ...req.body };
        if (body.images && Array.isArray(body.images)) {
            if (body.images.length > 5) {
                return res.status(400).json({ error: 'No se pueden agregar más de 5 imágenes' });
            }
            body.image = body.images[0] || '';
        } else if (body.image) {
            body.images = [body.image];
        }
        const product = new Product(body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'El producto ya existe' });
            return;
        }
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message || 'Datos obligatorios no válidos' });
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
        const body = { ...req.body };
        if (body.images && Array.isArray(body.images)) {
            if (body.images.length > 5) {
                return res.status(400).json({ error: 'No se pueden agregar más de 5 imágenes' });
            }
            body.image = body.images[0] || '';
        } else if (body.image && (!body.images || body.images.length === 0)) {
            body.images = [body.image];
        }
        const product = await Product.findByIdAndUpdate(req.params.id, body, {
            returnDocument: 'after',
            runValidators: true
        });
        if (!product) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json(product);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message || 'Datos obligatorios no válidos' });
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
        const newActive = product.active === false ? true : false;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { active: newActive },
            { returnDocument: 'after' }
        );
        res.json(updatedProduct);
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
            { returnDocument: 'after' }
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
