const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        default: "https://storage.googleapis.com/temp-34931.appspot.com/b33fd3c2-4e8e-4042-91c4-dbce3"
            + "4ef0c19_default.png?GoogleAccessId=firebase-adminsdk-nx02d%40temp-34931.iam.gserviceaccount."
            + "com&Expires=16730298000&Signature=VHVmsSKrfk90GkpoNYG3bhPZizZ90ZheWmvz50SK9%2FZtB3rMm9xd7gIAE2"
            + "fModuu05hlmYc384NyWmmCQKUnMYS2HhH7UtYd0nOByLAnQ93qTHBtxxdqrNTB3bXJA6bEUb5kLqMdqiyePkPjSnQAT2aXsnBPq"
            + "ZCsrycsKpxpcWyjDiJ6z361NpLGAGQK5ugGwa4q141D9a1ytu0UDB6%2Bg8VEmQgLu0HooZbdj4q7ySflqmsW8F2pPVQTwvyAuuVx"
            + "topmGQzvF1ceul3V%2FU7472rwVj%2Fne3UmrFvKJNLPyKTPd8HQbA45kuDTeIRMIGb6u2OOAgoyN57CEkHDndfFZA%3D%3D"
    },
    account: {
        type: Schema.Types.ObjectId,
        required: true
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number],
        },
    },
    address: {
        type: Object
    }
});

module.exports = mongoose.model('users', UserSchema);