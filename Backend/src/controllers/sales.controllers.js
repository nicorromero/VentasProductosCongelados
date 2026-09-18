const Sales   = require('../models/sale.model');
const Product = require('../models/product.model');

const getSales = async (req, res) => {
    try {
        if (req.usuario?.role === 'admin') {
            const sales = await Sales.find()
                .populate('items.product', 'name image price')
                .populate('user', 'name email')
                .sort({ date: -1 });
            return res.json(sales);
        }
        // Usuario autenticado no-admin: devuelve solo sus órdenes
        const sales = await Sales.find({ user: req.usuario.id })
            .populate('items.product', 'name image price')
            .sort({ date: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSaleById = async (req, res) => {
    try {
        const sale = await Sales.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.json(sale);
    } catch (error) {
        if (error.name === 'CastError') {
           res.status(400).json({ error: 'ID inválido' });
           return;
        }
        res.status(500).json({ message: error.message });
    }
};

const createSale = async (req, res) => {
    try {
        const newSale = new Sales(req.body);
        await newSale.save();
        res.status(201).json(newSale);

    } catch (error) {
        if(error.name === 'ValidationError') {
            res.status(400).json({ error: 'Datos obligatorios no válidos' });
            return;
        }
        res.status(500).json({ error: 'Error al crear la venta' });
    }
};

const deleteSale = async (req, res) => {
    try {
        const sale = await Sales.findByIdAndDelete(req.params.id);
        if(!sale){
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.json(sale)
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'ID inválido' });
        }
        res.status(500).json({ message: error.message });
    }
};


const createOrder = async (req, res) => {
    try {
        const { items, medioPago, metodoEntrega, facturacion, direccionEnvio } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'La orden debe tener al menos un producto' });
        }

        // Validar stock y construir items de la orden
        const orderItems = [];
        for (const entry of items) {
            const product = await Product.findById(entry.product);
            if (!product) {
                return res.status(404).json({ error: `Producto ${entry.product} no encontrado` });
            }
            if (product.stock < entry.quantity) {
                return res.status(400).json({ error: `Stock insuficiente para ${product.name}` });
            }
            orderItems.push({
                product:  product._id,
                quantity: entry.quantity,
                price:    product.price,
                subtotal: product.price * entry.quantity
            });
        }

        const total = orderItems.reduce((sum, i) => sum + i.subtotal, 0);

        // Descontar stock
        for (const entry of items) {
            await Product.findByIdAndUpdate(entry.product, { $inc: { stock: -entry.quantity } });
        }

        const orderData = {
            user:          req.usuario.id,
            items:         orderItems,
            total,
            medioPago,
            metodoEntrega,
            facturacion,
            estado:        'pendiente de pago',
            numeroOrden:   Date.now()
        };

        if (metodoEntrega === 'envio' && direccionEnvio) {
            orderData.direccionEnvio = direccionEnvio;
        }

        const newOrder = await Sales.create(orderData);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Sales.find({ user: req.usuario.id })
            .populate('items.product', 'name image price')
            .sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const ESTADOS_VALIDOS = ['pendiente de pago', 'pago confirmado', 'enviado', 'listo para retiro', 'entregado', 'cancelado'];
        const { estado } = req.body;

        if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        const order = await Sales.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        res.json(order);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'ID inválido' });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSales,
    getSaleById,
    createSale,
    deleteSale,
    createOrder,
    getMyOrders,
    updateOrderStatus
};