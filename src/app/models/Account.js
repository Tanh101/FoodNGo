const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const AccountSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    password: {
        type: String,
        required: true,
    }, 
    role: {
        type: String,
        required: true,
        default: 'user',
        enum: ['user', 'admin', 'restaurant', 'shipper']

    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'deleted', 'pending']
    },
    delete_at : {
        type: Date,
        default: null
    }

}, {timestamps: true});


module.exports = mongoose.model('account', AccountSchema);