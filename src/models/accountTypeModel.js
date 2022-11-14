const mongoose = require('mongoose');
const { Schema } = mongoose;

const AccountTypeSchema = new Schema({
    description: { type: String, required: true }
});

module.exports = mongoose.model('AccountType', AccountTypeSchema, 'accountTypes');