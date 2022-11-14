const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
    name: { type: String, required: true, lowercase: true },
    edad: { type: Number, required: true },
    recibido: { type: Boolean, required: true },
    comidas: { type: Array }
});

module.exports = mongoose.model('Student', studentSchema);