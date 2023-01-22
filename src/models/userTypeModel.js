const mongoose = require('mongoose');
const { Schema } = mongoose;

const userTypeSchema = new Schema({
    description: { type: String, required: true },
    code: { type: String, required: true }
});

module.exports = mongoose.model('userType', userTypeSchema, 'userTypes');