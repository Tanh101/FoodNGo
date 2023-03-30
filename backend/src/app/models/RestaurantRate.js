const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestaurantRateSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment',
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('restaurantRate', RestaurantRateSchema);

