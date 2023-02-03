const express = require('express');
const authenticateJWT = require('../middlewares/authentication');
const router = express.Router();
const randomWords = require('random-spanish-words');
const { body, param, validationResult } = require('express-validator');
const accountSchema = require('../models/accountModel');
const clientSchema = require('../models/clientModel');
const accountTypeSchema = require('../models/accountTypeModel');
const movementSchema = require('../models/movementModel');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const RepeatedAliasError = require('../errors/RepeatedAliasError');
const RepeatedAccountTypeError = require('../errors/RepeatedAccountTypeError');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info(`Start - GET /api/v1/accounts, query: ${JSON.stringify(req.query)}`);

        try {
            const authResponse = authenticateJWT(req, res);
            if (authResponse == 401 || authResponse == 403) {
                res.sendStatus(authResponse);
                return;
            }

            let filters = {};
            const accountTypeIdFilter = req.query.accountTypeId;
            if (accountTypeIdFilter != undefined)
                filters.accountType = accountTypeIdFilter;

            const aliasFilter = req.query.alias;
            if (aliasFilter != undefined) {
                filters.alias = {
                    $regex: '.*' + aliasFilter + '.*'
                };
            }

            const accountNumberFilter = req.query.accountNumber;
            if (accountNumberFilter != undefined) {
                filters.number = {
                    $regex: '.*' + accountNumberFilter + '.*'
                };
            }

            const accounts = await accountSchema
                .find(filters)
                .populate('client', 'id name lastName')
                .populate('accountType', 'id description code')
                .sort({creationDate: -1 });

            logger.info(`End - GET /api/v1/accounts, query: ${JSON.stringify(req.query)}`);
            res.json(accounts);
        } catch (error) {
            logger.error(`Error searching accounts. Error: ${error}`);
            next(error);
        }
    }
);

router.get(
    '/:accountId',
    param('accountId').not().isEmpty().isLength(24),
    async (req, res, next) => {
        logger.info(`Start - GET /api/v1/accounts/${req.params.accountId}`);

        try {
            const authResponse = authenticateJWT(req, res);
            if (authResponse == 401 || authResponse == 403) {
                res.sendStatus(authResponse);
                return;
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating request. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating request", errors.array());
            }

            const accountId = req.params.accountId;

            const account = await accountSchema
                .findOne({ _id: accountId })
                .populate('client', 'id name lastName')
                .populate('accountType', 'id description code');

            if (account == null) {
                logger.error(`Account with id ${accountId} not found`);
                throw new NotFoundError(`Account with id ${accountId} not found`);
            }

            logger.info(`End - GET /api/v1/accounts/${req.params.accountId}`);
            res.json(account);
        } catch (error) {
            logger.error(`Error getting account. Error: ${error}`);
            next(error);
        }
    }
);

router.post(
    '/',
    body('clientId').not().isEmpty().isLength(24),
    body('accountTypeCode').not().isEmpty(),
    body('alias').optional().isString().isLength({ min: 10, max: 200 }),
    body('offLimitAmount').optional(),
    async (req, res, next) => {
        logger.info(`Start - POST /api/v1/accounts, body: ${JSON.stringify(req.body)}`);

        try {
            const authResponse = authenticateJWT(req, res);
            if (authResponse == 401 || authResponse == 403) {
                res.sendStatus(authResponse);
                return;
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const { clientId, accountTypeCode, offLimitAmount } = req.body;
            let { alias } = req.body;

            const client = await clientSchema.findById(clientId);
            if (client == null) {
                logger.error(`Client with id ${clientId} not found`);
                throw new NotFoundError(`Client with id ${clientId} not found`);
            }

            const accountType = await accountTypeSchema.findOne({ code: accountTypeCode });
            if (accountType == null) {
                logger.error(`Account type with code ${accountTypeCode} not found`);
                throw new NotFoundError(`Account type with code ${accountTypeCode} not found`);
            }

            const savedAccount = await accountSchema.findOne({ client: clientId, accountType: accountType._id });
            if (savedAccount != null) {
                logger.error(`Repeated account. Client id: ${clientId}, Account type id: ${accountType._id}`);
                throw new RepeatedAccountTypeError(`Repeated account. Client id: ${clientId}, Account type id: ${accountType._id}`);
            }

            if (alias == null || alias == '')
                alias = generateAlias();

            const accountWithSameAlias = await accountSchema.findOne({ alias: alias });
            if (accountWithSameAlias != null) {
                logger.error(`Repeated alias. Cannot use alias ${alias}`);
                throw new RepeatedAliasError(`Repeated alias. Cannot use alias ${alias}`);
            }

            let accountNumberRepeated = true;
            let accountNumber;

            while (accountNumberRepeated) {
                accountNumber = `182/${generateAccountNumber(10000, 99999)}`;
                const accountWithSameNumber = await accountSchema.findOne({ number: accountNumber });

                if (accountWithSameNumber == null)
                    accountNumberRepeated = false;
            }

            const account = new accountSchema({
                client: clientId,
                accountType: accountType._id,
                alias: alias,
                number: accountNumber,
                balance: 0,
                creationDate: new Date(),
                enable: true,
                deleteDate: null,
                offLimitAmount: accountTypeCode === 'CAJA_AHORRO' ? 0 : offLimitAmount
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
    return randomWords(3).map(word => word.toUpperCase()).join('.')
}

function generateAccountNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

router.patch(
    '/:accountId',
    param('accountId').not().isEmpty().isLength(24),
    body('enable').optional().isBoolean(),
    body('alias').optional().isString().isLength({ min: 10, max: 200 }),
    body('offLimitAmount').optional().isNumeric(),
    async (req, res, next) => {
        logger.info(`Start - PATCH /api/v1/accounts/${req.params.accountId}, body: ${JSON.stringify(req.body)}`);

        try {
            const authResponse = authenticateJWT(req, res);
            if (authResponse == 401 || authResponse == 403) {
                res.sendStatus(authResponse);
                return;
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const accountId = req.params.accountId;
            const { enable, alias, offLimitAmount } = req.body;

            const account = await accountSchema.findById(accountId);
            if (account == null) {
                logger.error(`Account with id ${accountId} not found`);
                throw new NotFoundError(`Account with id ${accountId} not found`);
            }

            if (alias != null) {
                const accountWithSameAlias = await accountSchema.findOne({ alias: alias });
                if (accountWithSameAlias != null && accountWithSameAlias._id != accountId) {
                    logger.error(`Repeated alias. Cannot use alias ${alias} for account id: ${accountId}`);
                    throw new RepeatedAliasError(`Repeated alias. Cannot use alias ${alias} for account id: ${accountId}`);
                }
            }

            const newValues = {
                alias,
                enable
            };

            if (offLimitAmount != null)
                newValues.offLimitAmount = offLimitAmount;

            if (enable != null && !enable)
                newValues.deleteDate = new Date()
            else if (enable != null && enable)
                newValues.deleteDate = null;

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
    '/:accountId/movements',
    param('accountId').isLength(24),
    async (req, res, next) => {
        logger.info(`Start - GET /api/v1/accounts/${req.params.accountId}/movements`);

        try {
            const authResponse = authenticateJWT(req, res);
            if (authResponse == 401 || authResponse == 403) {
                res.sendStatus(authResponse);
                return;
            }

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