const express = require('express');
const router = express.Router();
const accountSchema = require('../models/accountModel');
const logger = require('../config/logger');

router.get('/', async (req, res) => {
    logger.info('Inicio - GET /api/v1/accounts');
    
    const accounts = await accountSchema
        .find()
        .populate('client')
        .populate('accountType');

    logger.info(`Fin - GET /api/v1/accounts`);
    res.json(accounts);
});

router.post('/', async (req, res) => {
    logger.info('Inicio - POST /api/v1/accounts');

    const { clientId } = req.body;

    const account = new accountSchema({
        client: clientId,
        creationDate: new Date(),
        enable: true
    });

    accountSchema.create(account);

    logger.info('Fin - POST /api/v1/accounts');
    res.json({ status: 'Created' });
});

module.exports = router;