const mongoose = require('mongoose');


const RetstaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        stress: {
            type: String,
        },
        province: {
            type: String
        },
        district: {
            type: String
        },
        commute: {
            type: String
        },
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    media: [{
        type: {
            type: String,
        },
        url: {
            type: String,
        }
    }],
    url: {
        type: String,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    rate: {
        type: Number,
        required: true,
        default: 0

    },
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'online', 'busy', 'offline', 'deleted'],
    },
    delete_at: {
        type: Date,
        default: null,
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: true,
    },


}, { timestamps: true });


RetstaurantSchema.index({ location: "2dsphere" });
module.exports = mongoose.model('restaurant', RetstaurantSchema);