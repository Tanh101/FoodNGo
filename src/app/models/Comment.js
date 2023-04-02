const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    media: [{
            type: {
                type: String,
            },
            url: {
                type: String,
            }
        }],
    delete_at: {
        type: Date,
        default: null
    }
}, { timestamps: true });
module.exports = mongoose.model('comment', CommentSchema);

