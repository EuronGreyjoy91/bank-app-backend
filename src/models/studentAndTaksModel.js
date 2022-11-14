const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentsAndTasksSchema = new Schema({
    name: { type: String, required: true },
    student: {type: Schema.Types.ObjectId, ref: 'Student', required: true},
});

module.exports = mongoose.model('StudentAndTasksSchema', studentsAndTasksSchema);

/*
var postSchema = new Schema({
    name: String,
    postedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    dateCreated: Date,
    comments: [{body:"string", by: mongoose.Schema.Types.ObjectId}],
});
*/