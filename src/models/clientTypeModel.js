const mongoose = require('mongoose');
const { Schema } = mongoose;

const clientTypeSchema = new Schema({
    description: { type: String, required: true }
});

module.exports = mongoose.model('clientType', clientTypeSchema, 'clientTypes');