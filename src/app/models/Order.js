const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userLocation: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    shipper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shipper',
        default: null
    },
    address: {
        type: Object,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'card']
    },
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'cancelled', 'refused', 'ready', 'preparing', 'delivered', 'delivering',]
    },
    paymentStatus: {
        type: String,
        required: true,
        default: 'unpaid',
        enum: ['unpaid', 'paid']
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true
    },
    restaurantLocation: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    orderItems: [
        {
            product: {
                _id: {
                    type: Schema.Types.ObjectId,
                    ref: 'product',
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                description: {
                    type: String,
                    required: true
                },
                media: [{
                    type: {
                        type: String,
                        required: true,
                        enum: ['image', 'video']
                    },
                    url: {
                        type: String,
                        required: true
                    }
                }],
                categories: [{
                    type: Schema.Types.ObjectId,
                    ref: 'category',
                    required: true,
                }],
                restaurant: {
                    type: Schema.Types.ObjectId,
                    ref: 'restaurant',
                    required: true
                },
                status: {
                    type: String,
                    required: true,
                    default: 'active',
                    enum: ['active', 'deleted', 'deactive']
                }
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    deliveryFee: {
        type: Number,
    },
    deliveryTime: {
        type: Number,
    },
    total: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        default: null
    },
    reason: {
        type: String,
        default: null
    },
    deleteAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });
OrderSchema.index({ userLocation: "2dsphere" });
OrderSchema.index({ restaurantLocation: "2dsphere" });

module.exports = mongoose.model('order', OrderSchema);
