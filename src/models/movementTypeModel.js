const mongoose = require('mongoose');
const { Schema } = mongoose;

const movementTypeSchema = new Schema({
    description: { type: String, required: true },
    code: { type: String, required: true }
});

module.exports = mongoose.model('movementType', movementTypeSchema, 'movementTypes');