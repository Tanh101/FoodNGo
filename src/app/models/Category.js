const mongoose = require('mongoose');


const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: [
            'acclaimed', 'chicken', 'fast food', 'drinks', 'desserts',
            'burgers', 'sandwiches', 'coffee', 'breakfast', 'bakery',
             'healthy', 'vegan', 'pizza'
        ]
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('category', CategorySchema);