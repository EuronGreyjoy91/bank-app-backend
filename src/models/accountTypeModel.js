const mongoose = require('mongoose');
const { Schema } = mongoose;

const accountTypeSchema = new Schema({
    description: { type: String, required: true }
});

module.exports = mongoose.model('accountType', accountTypeSchema, 'accountTypes');