const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestaurantRateSchema = new Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurant',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    comment: {
        content: {
            type: String,
            required: true
        },
        media: [{
            type: {
                type: String,
            },
            url: {
                type: String,
            }
        }],
    }
}, { timestamps: true });

module.exports = mongoose.model('restaurantRate', RestaurantRateSchema);

