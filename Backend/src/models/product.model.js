const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    details: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    images: {
        type: [String],
        default: [],
        validate: [
            function (val) {
                return !val || val.length <= 5;
            },
            'El producto no puede tener más de 5 imágenes'
        ]
    },
    badge: { type: String, default: '' },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    active: { type: Boolean, default: true }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            if ((!ret.images || ret.images.length === 0) && ret.image) {
                ret.images = [ret.image];
            } else if (ret.images && ret.images.length > 0 && !ret.image) {
                ret.image = ret.images[0];
            }
            return ret;
        }
    },
    toObject: {
        transform: (doc, ret) => {
            if ((!ret.images || ret.images.length === 0) && ret.image) {
                ret.images = [ret.image];
            } else if (ret.images && ret.images.length > 0 && !ret.image) {
                ret.image = ret.images[0];
            }
            return ret;
        }
    }
});

productSchema.pre('save', function (next) {
    if (this.images && this.images.length > 0) {
        this.image = this.images[0];
    } else if (this.image) {
        this.images = [this.image];
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);