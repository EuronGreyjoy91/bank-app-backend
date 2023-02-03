const mongoose = require('mongoose');
const { Schema } = mongoose;

const accountSchema = new Schema({
    client: {
        type: mongoose.ObjectId,
        ref: 'client'
    },
    accountType: {
        type: mongoose.ObjectId,
        ref: 'accountType'
    },
    alias: { type: String, required: true },
    number: { type: String, required: true },
    balance: { type: Number, required: true },
    creationDate: { type: Date, required: true },
    enable: { type: Boolean, required: true },
    deleteDate: { type: Date },
    offLimitAmount: {type: Number, required: true}
})

module.exports = mongoose.model('account', accountSchema, 'accounts');
