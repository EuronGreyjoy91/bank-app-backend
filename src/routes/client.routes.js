const express = require('express');
const router = express.Router();
const clientRepository = require('../models/clientModel');

router.get('/', async (req, res) => {
    const clients = await clientRepository.find();
    res.json(clients);
});

module.exports = router;