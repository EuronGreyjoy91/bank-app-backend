const express = require('express');
const router = express.Router();
const clientSchema = require('../models/clientModel');
const logger = require('../config/logger');

router.get('/', async (req, res) => {
    logger.info('Inicio - GET /api/v1/clients');

    const clients = await clientSchema.find();

    logger.info('Fin - GET /api/v1/clients');
    res.json(clients);
});

module.exports = router;