const mongoose = require('mongoose');
const { Schema } = mongoose;

const cardSchema = new Schema({
    //TODO: AGREGAR CVV
    number: { type: String },
    expirationDate: { type: String, required: true },
    creationDate: { type: Date, required: true },
    enable: { type: Boolean, required: true },
    deleteDate: { type: Date },
    account: {
        type: mongoose.ObjectId,
        ref: 'account'
    },
    cardType: {
        type: mongoose.ObjectId,
        ref: 'cardType'
    },
})

module.exports = mongoose.model('card', cardSchema, 'cards');