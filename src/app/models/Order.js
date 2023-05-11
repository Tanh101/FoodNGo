const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    shipper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'card']
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'preparing',
        enum: ['accepted', 'preparing', 'ready', 'delivered', 'delivering', 'cancelled']
    },
    paymentStatus: {
        type: String,
        required: true,
        default: 'unpaid',
        enum: ['unpaid', 'paid']
    },
    orderItems: [
        {
            product: {
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
                category: {
                    type: String,
                    required: true,
                },
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
    total: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        default: null
    },
    deleteAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });


module.exports = mongoose.model('order', OrderSchema);
