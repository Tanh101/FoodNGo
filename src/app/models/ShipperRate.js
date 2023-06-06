const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShipperRateSchema = new Schema({
    shipper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shipper',
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
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('shipperRate', ShipperRateSchema);