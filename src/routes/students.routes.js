const express = require('express');
const router = express.Router();
const studentSchema = require('../models/studentModels');

router.get('/', async (req, res) => {
    const students = await studentSchema.find();
    res.json(students);
});

router.post('/', async (req, res) => {
    const { name, edad, recibido } = req.body;
    const newStudent = new studentSchema({
        name,
        edad,
        recibido
    });

    await studentSchema.create(newStudent);
    res.json({ status: "Student saved" });
});

module.exports = router;