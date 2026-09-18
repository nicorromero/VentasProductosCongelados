const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price:    { type: Number, required: true },
        subtotal: { type: Number, required: true }
    }],

    total: { type: Number, required: true, min: 0 },

    // Campo legacy — mantener para no romper código viejo
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },

    // Campos de Orden de Compra
    numeroOrden: { type: Number },

    medioPago: {
        type: String,
        enum: ['transferencia', 'efectivo'],
        required: false
    },

    metodoEntrega: {
        type: String,
        enum: ['retiro', 'envio'],
        required: false
    },

    facturacion: {
        nombreCompleto: { type: String },
        dni:            { type: String },
        domicilio:      { type: String }
    },

    direccionEnvio: {
        calle:         { type: String },
        numero:        { type: String },
        ciudad:        { type: String },
        provincia:     { type: String },
        codigoPostal:  { type: String }
    },

    estado: {
        type: String,
        default: 'pendiente de pago',
        enum: [
            'pendiente de pago',
            'pago confirmado',
            'enviado',
            'entregado',
            'listo para retiro',
            'cancelado'
        ]
    }
});

module.exports = mongoose.model('Sale', SaleSchema);