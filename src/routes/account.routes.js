const express = require('express');
const router = express.Router();
const accountSchema = require('../models/accountModel');
const logger = require('../config/logger');
const { body, validationResult } = require('express-validator');
const ValidationError = require('../errors/ValidationError');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/accounts');

        try {
            const accounts = await accountSchema
                .find()
                .populate('client')
                .populate('accountType');

            logger.info(`End - GET /api/v1/accounts`);
            res.json(accounts);
        } catch (error) {
            logger.error(`Error searching accounts. Error: ${error}`);
            next(error);
        }
    }
);

router.post(
    '/',
    async (req, res, next) => {
        logger.info('Start - POST /api/v1/accounts');

        try {
            const { clientId } = req.body;

            const account = new accountSchema({
                client: clientId,
                creationDate: new Date(),
                enable: true
            });

            await accountSchema.create(account);

            logger.info('End - POST /api/v1/accounts');
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Error saving account. Error: ${error}`);
            next(error);
        }
    }
);

router.patch(
    '/:accountId',
    body('enable').isBoolean(),
    async (req, res, next) => {
        logger.info(`Start - PATCH /api/v1/accounts. AccountId: ${req.params.accountId}, body: ${JSON.stringify(req.body)}`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                throw new ValidationError("Error on validation of body", errors.array());

            const accountId = req.params.accountId;
            const { enable } = req.body;

            const newStatus = { enable };

            await accountSchema.findByIdAndUpdate(accountId, newStatus);

            logger.info(`End - PATCH /api/v1/accounts. AccountId: ${accountId}, body: ${JSON.stringify(req.body)}`);
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Error on patch account. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;