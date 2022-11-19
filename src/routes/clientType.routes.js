const express = require('express');
const router = express.Router();
const clientTypeSchema = require('../models/clientTypeModel');

router.get('/', async (req, res) => {
    const clientTypes = await clientTypeSchema.find();
    res.json(clientTypes);
});

module.exports = router;