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
        default: 'online',
        enum: ['online', 'busy', 'offline'],
    },
    delete_at: {
        type: Date,
        default: null,
    },


}, { timestamps: true });


module.exports = mongoose.model('restaurant', RetstaurantSchema);