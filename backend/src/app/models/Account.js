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
        maxLength: 20 

    }, 
    role: {
        type: String,
        required: true,
        default: 'guest',
        enum: ['guest', 'user', 'admin', 'seller', 'shipper']

    },
    delete_at : {
        type: Date,
        default: null
    }

}, {timestamps: true});


module.exports = mongoose.model('account', AccountSchema);