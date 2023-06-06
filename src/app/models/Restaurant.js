const mongoose = require('mongoose');


const RetstaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
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
    address: {
        type: String
    },
    media: [{
        type: {
            type: String,
        },
        url: {
            type: String,
        }
    }],
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
        default: 4

    },
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'open', 'close', 'deleted'],
    },
    openingHours: {
        type: {
            open: {
                type: String
            },
            close: {
                type: String
            } 
        }
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    }],
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