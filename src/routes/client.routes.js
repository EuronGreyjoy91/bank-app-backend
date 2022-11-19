const express = require('express');
const router = express.Router();
const clientSchema = require('../models/clientModel');

router.get('/', async (req, res) => {
    const clients = await clientSchema.find();
    res.json(clients);
});

module.exports = router;