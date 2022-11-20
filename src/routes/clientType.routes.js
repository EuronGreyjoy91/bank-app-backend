const express = require('express');
const router = express.Router();
const clientTypeSchema = require('../models/clientTypeModel');
const logger = require('../config/logger');

router.get('/', async (req, res) => {
    logger.info('Inicio - GET /api/v1/clientTypes');
    
    const clientTypes = await clientTypeSchema.find();

    logger.info('Fin - GET /api/v1/clientTypes');
    res.json(clientTypes);
});

module.exports = router;