const express = require('express');
const router = express.Router();
const clientTypeRepository = require('../models/clientTypeModel');

router.get('/', async (req, res) => {
    const clientTypes = await clientTypeRepository.find();
    res.json(clientTypes);
});

module.exports = router;