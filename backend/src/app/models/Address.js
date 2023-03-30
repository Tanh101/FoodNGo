const mongoose = require('mongoose');
const AddressSchema = new mongoose.Schema ({
    stress: {
        type: String,
        required: true
    },
    province: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'province'
    },
});

module.exports = mongoose.model('address', AddressSchema);