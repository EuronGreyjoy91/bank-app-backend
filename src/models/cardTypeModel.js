const mongoose = require('mongoose');
const { Schema } = mongoose;

const cardTypeSchema = new Schema({
    description: { type: String, required: true }
});

module.exports = mongoose.model('cardType', cardTypeSchema, 'cardTypes');