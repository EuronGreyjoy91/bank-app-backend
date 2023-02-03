const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    userName: { type: String, required: true },
    password: { type: String, required: true },
    userType: {
        type: mongoose.ObjectId,
        ref: 'userType'
    },
    creationDate: { type: Date, required: true },
    enable: { type: Boolean, required: true },
    deleteDate: { type: Date }
});

module.exports = mongoose.model('user', userSchema, 'users');