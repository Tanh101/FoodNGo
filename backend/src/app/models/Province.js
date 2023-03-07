const mongoose = require('mongoose');
const district = require('./District');

const ProvinceSchema = new mongoose.Schema({
    name: {
        type: String,
    }, 
    districts: [district]
});



module.exports = mongoose.model('province', ProvinceSchema);