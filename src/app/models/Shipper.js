const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ShipperSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        require: true,
        unique: true
    },
    gender: {
        type: String,
    },
    avatar: {
        type: String,
    },
    idNumber: {
        type: String,
        require: true
    },
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'online', 'deleted', 'offline']
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number],
        },
    },
    address: {
        type: Object
    },
    rate: {
        type: Number,
        default: 0
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'account',
        required: true
    },
    deleteAt: {
        type: Date,
        default: null
    },
}, { timestamps: true });

module.exports = mongoose.model('shipper', ShipperSchema);