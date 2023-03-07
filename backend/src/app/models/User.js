const mongoose = require('mongoose');
const Account = require('./Account');

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
        type: Account,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: 'address',
    },
});

module.exports = mongoose.model('users', UserSchema);