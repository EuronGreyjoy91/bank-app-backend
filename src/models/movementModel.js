const mongoose = require('mongoose');
const { Schema } = mongoose;

const movementSchema = new Schema({
    concept: { type: String },
    creationDate: { type: Date, required: true },
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
    },
    client: {
        type: mongoose.ObjectId,
        ref: 'client'
    }
});

module.exports = mongoose.model('movement', movementSchema, 'movements');