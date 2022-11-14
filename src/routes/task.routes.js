const express = require('express');
const router = express.Router();
const Task = require('../models/taskModel');

router.get('/', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks)
});

router.get('/:id', async (req, res) => {
    const task = await Task.findById(req.params.id);
    res.json(task);
});

router.post('/', async (req, res) => {
    const { title, description } = req.body;
    const newTask = new Task({
        title,
        description
    });

    console.log(newTask);
    await Task.create(newTask);
    res.json({ status: "Task saved" });
});

router.put('/:id', async (req, res) => {
    const { title, description } = req.body;
    const updatedTask = { title, description };

    await Task.findByIdAndUpdate(req.params.id, updatedTask);
    res.json({ status: "Task updated" });
});

router.delete('/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ status: "Task deleted" });
});

module.exports = router;