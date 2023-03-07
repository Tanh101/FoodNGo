const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductRateSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    
}, {timestamps: true});

module.exports = mongoose.model('productRate', ProductRateSchema);
