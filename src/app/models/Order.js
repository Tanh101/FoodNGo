const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'card']
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true
    },


}, {timestamps: true});


module.exports = mongoose.model('order', OrderSchema);
