const mongoose = require('mongoose');


const MediaSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['image', 'video']
    },

    url: {
        type: String,
        require: true
    },
});


module.exports = mongoose.model('media', MediaSchema);

