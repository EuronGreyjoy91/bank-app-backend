const express = require('express');
const mongoose = require('mongoose');
const { ObjectId } = mongoose;
const router = express.Router();
const studentAndTasksSchema = require('../models/studentAndTaksModel');

router.get('/', async (req, res) => {
    const studentsAndTasks = await studentAndTasksSchema.find();
    res.json(studentsAndTasks);
});

router.post('/', async (req, res) => {
    const { name, student } = req.body;

    console.log(name, student);
    //const student = new ObjectId(student_id);
    //console.log(student);

    const newStudentAndTasks = new studentAndTasksSchema({
        name,
        student
    });

    await studentAndTasksSchema.create(newStudentAndTasks);
    res.json({ status: "Student and task saved" });
});

module.exports = router;