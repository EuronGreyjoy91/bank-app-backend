const express = require('express');
const router = express.Router();
const accountTypeSchema = require('../models/accountTypeModel');
const logger = require('../config/logger');

router.get('/', async (req, res) => {
    logger.info('Inicio - GET /api/v1/accountTypes');

    const accountTypes = await accountTypeSchema.find();

    logger.info('Fin - GET /api/v1/accountTypes');
    res.json(accountTypes);
});

module.exports = router;