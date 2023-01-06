const express = require('express');
const router = express.Router();
const randomWords = require('random-spanish-words');
const { body, param, validationResult } = require('express-validator');
const accountSchema = require('../models/accountModel');
const clientSchema = require('../models/clientModel');
const accountTypeSchema = require('../models/accountTypeModel');
const cardSchema = require('../models/cardModel');
const movementSchema = require('../models/movementModel');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const RepeatedError = require('../errors/RepeatedError');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/accounts');

        try {
            const accounts = await accountSchema
                .find()
                .populate('client', 'id name')
                .populate('accountType', 'id description');

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
    body('clientId').not().isEmpty().isLength(24),
    body('accountTypeId').not().isEmpty().isLength(24),
    async (req, res, next) => {
        logger.info(`Start - POST /api/v1/accounts, body: ${JSON.stringify(req.body)}`);
        
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const { clientId, accountTypeId } = req.body;

            const client = await clientSchema.findById(clientId);
            if (client == null) {
                logger.error(`Client with id ${clientId} not found`);
                throw new NotFoundError(`Client with id ${clientId} not found`);
            }

            const accountType = await accountTypeSchema.findById(accountTypeId);
            if (accountType == null) {
                logger.error(`Account type with id ${accountTypeId} not found`);
                throw new NotFoundError(`Account type with id ${accountTypeId} not found`);
            }

            const savedAccount = await accountSchema.findOne({ client: clientId, accountType: accountTypeId });
            if (savedAccount != null) {
                logger.error(`Repeated account. Client id: ${clientId}, Account type id: ${accountTypeId}`);
                throw new RepeatedError(`Repeated account. Client id: ${clientId}, Account type id: ${accountTypeId}`);
            }

            const account = new accountSchema({
                client: clientId,
                accountType: accountTypeId,
                alias: generateAlias(),
                number: 'TEST-CHANGE-LATER', //TODO: CAMBIAR!
                balance: 0,
                creationDate: new Date(),
                enable: true,
                deleteDate: null
            });

            await accountSchema.create(account);

            logger.info(`End - POST /api/v1/accounts, body: ${JSON.stringify(req.body)}`);
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Error saving account. Error: ${error}`);
            next(error);
        }
    }
);

function generateAlias() {
    return randomWords(3).map(word => word.toUpperCase()).join('-')
}

router.patch(
    '/:accountId',
    param('accountId').not().isEmpty().isLength(24),
    body('enable').optional().isBoolean(),
    body('alias').optional().isString(),
    async (req, res, next) => {
        logger.info(`Start - PATCH /api/v1/accounts/${req.params.accountId}, body: ${JSON.stringify(req.body)}`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const accountId = req.params.accountId;
            const { enable, alias } = req.body;

            const account = await accountSchema.findById(accountId);
            if (account == null) {
                logger.error(`Account with id ${accountId} not found`);
                throw new NotFoundError(`Account with id ${accountId} not found`);
            }

            if (alias != null) {
                const accountWithSameAlias = await accountSchema.findOne({ alias: alias });
                if (accountWithSameAlias != null) {
                    logger.error(`Repeated alias. Cannot use alias ${alias} for account id: ${accountId}`);
                    throw new RepeatedError(`Repeated alias. Cannot use alias ${alias} for account id: ${accountId}`);
                }
            }

            const newValues = {
                alias,
                enable
            };

            await accountSchema.findByIdAndUpdate(accountId, newValues);

            logger.info(`End - PATCH /api/v1/accounts/${req.params.accountId}, body: ${JSON.stringify(req.body)}`);
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Error on update account. Error: ${error}`);
            next(error);
        }
    }
);

router.get(
    '/:accountId/cards',
    param('accountId').not().isEmpty().isLength(24),
    async (req, res, next) => {
        logger.info(`Start - GET /api/v1/accounts/${req.params.accountId}/cards`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const accountId = req.params.accountId;

            const account = await accountSchema.findById(accountId);
            if (account == null) {
                logger.error(`Account with id ${accountId} not found`);
                throw new NotFoundError(`Account with id ${accountId} not found`);
            }

            const cards = await cardSchema
                .find({ accountId: accountId })
                .populate('cardType', 'id description')
                .populate('account', 'id name');

            logger.info(`End - GET /api/v1/accounts/${req.params.accountId}/cards`);
            res.json(cards);
        } catch (error) {
            logger.error(`Error searching cards for account. Error: ${error}`);
            next(error);
        }
    }
);

router.get(
    '/:accountId/movements',
    param('accountId').isLength(24),
    async (req, res, next) => {
        logger.info(`Start - GET /api/v1/accounts/${req.params.accountId}/movements`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const accountId = req.params.accountId;

            const account = await accountSchema.findById(accountId);
            if (account == null) {
                logger.error(`Account with id ${accountId} not found`);
                throw new NotFoundError(`Account with id ${accountId} not found`);
            }

            const movements = await movementSchema
                .find({ accountId: accountId })
                .populate('originAccount', 'id description')
                .populate('destinyAccount', 'id name')
                .populate('movementType', 'id name');

            logger.info(`End - GET /api/v1/accounts/${req.params.accountId}/movements`);
            res.json(movements);
        } catch (error) {
            logger.error(`Error searching movements for account. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;