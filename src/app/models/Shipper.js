const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ShipperSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    CCCD: {
        type: String,
        require: true
    },
    status: {
        type: String,
        required: true,
        default: 'online',
        enum: ['online', 'deleted', 'offline']
    },
    rate : {
        type: Number,
        default: null
    },
    deleteAt: {
        type: Date,
        default: null
    },
}, { timestamps: true });

module.exports = mongoose.model('shipper', ShipperSchema);