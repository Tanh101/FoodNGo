const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
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
        enum: ['active', 'deleted']
    },
    deleteAt: {
        type: Date,
        default: null
    },
}, { timestamps: true });

module.exports = mongoose.model('product', ProductSchema);