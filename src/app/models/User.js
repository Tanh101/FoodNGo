const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
    },
    account: {
        type: Schema.Types.ObjectId,
        required: true
    },
    location: {
        coordinates: {
            type: [Number],
        },
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
});

module.exports = mongoose.model('users', UserSchema);