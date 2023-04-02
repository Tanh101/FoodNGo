
const mongoose = require('mongoose');
const AddressSchema = new mongoose.Schema ({
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
});
module.exports = mongoose.model('address', AddressSchema);