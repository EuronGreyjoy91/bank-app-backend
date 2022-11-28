const mongoose = require('mongoose');
const { Schema } = mongoose;

const clientSchema = new Schema({
    name: { type: String },
    lastName: { type: String },
    document: { type: String },
    businessName: { type: String },
    adress: { type: Object },
    cuitCuil: { type: String, required: true },
    creationDate: { type: Date, required: true },
    enable: { type: Boolean, required: true },
    deleteDate: { type: Date },
    clientType: {
        type: mongoose.ObjectId,
        ref: 'clientType'
    },
})

module.exports = mongoose.model('client', clientSchema, 'clients');