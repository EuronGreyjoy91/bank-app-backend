const mongoose = require('mongoose');
const { Schema } = mongoose;

const movementSchema = new Schema({
    concept: { type: String },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    originAccount: {
        type: mongoose.ObjectId,
        ref: 'account'
    },
    destinyAccount: {
        type: mongoose.ObjectId,
        ref: 'account'
    },
    movementType: {
        type: mongoose.ObjectId,
        ref: 'movementType'
    }
});

module.exports = mongoose.model('movement', movementSchema, 'movements');