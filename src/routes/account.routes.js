const express = require('express');
const router = express.Router();
const accountSchema = require('../models/accountModel');
const logger = require('../config/logger');
const { body, validationResult } = require('express-validator');
const ValidationError = require('../errors/ValidationError');
const CustomError = require('../errors/CustomError');

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

router.patch(
    '/:accountId',
    body('enable').isBoolean(),
    async (req, res, next) => {
        logger.info(`Inicio - PATCH /api/v1/accounts. AccountId: ${req.params.accountId}, body: ${JSON.stringify(req.body)}`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                throw new ValidationError("Error al validar", errors.array());

            const accountId = req.params.accountId;
            const { enable } = req.body;

            const newStatus = { enable };

            await accountSchema.findByIdAndUpdate(accountId, newStatus);

            logger.info(`Fin - PATCH /api/v1/accounts. AccountId: ${accountId}, body: ${JSON.stringify(req.body)}`);
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Guarda q paso algo. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;