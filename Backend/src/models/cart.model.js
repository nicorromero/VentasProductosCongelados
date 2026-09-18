const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

        quantity: { type: Number, required: true, min: 1 }
    }],

    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('Cart', cartSchema);