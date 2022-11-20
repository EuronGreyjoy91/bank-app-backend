const express = require('express');
const router = express.Router();
const accountSchema = require('../models/accountModel');
const logger = require('../config/logger');
const ValidationError = require('../exceptions/ValidationError');

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

    await accountSchema.create(account);

    logger.info('Fin - POST /api/v1/accounts');
    res.json({ status: 'Created' });
});

router.patch('/:accountId', async (req, res, next) => {
    try {
        const accountId = req.params.accountId;
        const { enable } = req.body;

        logger.info(`Inicio - PATCH /api/v1/accounts. AccountId: ${accountId}, enable: ${enable}`);


        if (enable == null) {
            throw new ValidationError('accountId cannot be empty');
        }

        const newStatus = { enable };

        await accountSchema.findByIdAndUpdate(accountId, newStatus);

        logger.info(`Fin - PATCH /api/v1/accounts. AccountId: ${accountId}, enable: ${enable}`);
        res.json({ status: 'OK' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;