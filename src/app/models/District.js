const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DistrictSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['Ha Noi', 'Da Nang', 'TP Ho Chi Minh'],
    },
});
module.exports = mongoose.model('district', DistrictSchema);