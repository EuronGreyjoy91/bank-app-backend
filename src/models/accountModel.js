const mongoose = require('mongoose');
const { Schema } = mongoose;

const accountSchema = new Schema({
    client: {
        type: mongoose.ObjectId,
        ref: 'client'
    },
    creationDate: { type: Date, required: true },
    enable: { type: Boolean, required: true },
    deleteDate: { type: Date }
})

module.exports = mongoose.model('account', accountSchema, 'accounts');
