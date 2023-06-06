const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
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
    }
});

module.exports = mongoose.model('users', UserSchema);