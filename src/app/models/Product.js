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
    images: {
        type: [String],
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true
    },
    amount: {
        type: Number,
        required: true
        
    },
    deleteAt: {
        type: Date,
        default: null
    },
}, {timestamps: true});