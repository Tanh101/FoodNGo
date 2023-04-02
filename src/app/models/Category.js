const mongoose = require('mongoose');


const CategorySchema = new  mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Cơm', 'Cháo', 'Bún', 'Nước giải khát', 'Trà sữa']
    },
});

module.exports = mongoose.model('category', CategorySchema);