const express = require('express');
const authenticateJWT = require('../middlewares/authentication');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const accountSchema = require('../models/accountModel');
const clientSchema = require('../models/clientModel');
const movementTypeSchema = require('../models/movementTypeModel');
const movementSchema = require('../models/movementModel');
const ValidationError = require('../errors/ValidationError');
const InvalidAmountError = require('../errors/InvalidAmountError');
const NotFoundError = require('../errors/NotFoundError');
const logger = require('../config/logger');

router.post(
    '/',
    body('clientId').not().isEmpty().isLength(24),
    body('accountId').not().isEmpty().isLength(24),
    body('concept').optional().not().isEmpty(),
    body('aliasNumber').optional().not().isEmpty(),
    body('movementTypeCode').not().isEmpty(),
    body('amount').not().isEmpty(),
    async (req, res, next) => {
        logger.info(`Start - POST /api/v1/movements, body: ${JSON.stringify(req.body)}`);

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

            const { clientId, accountId, movementTypeCode, amount, concept, aliasNumber } = req.body;

            const client = await clientSchema.findById(clientId);
            if (client == null) {
                logger.error(`Client with id ${clientId} not found`);
                throw new NotFoundError(`Client with id ${clientId} not found`);
            }

            const movementType = await movementTypeSchema.findOne({ code: movementTypeCode });
            if (movementType == null) {
                logger.error(`Movement type with code ${movementTypeCode} not found`);
                throw new NotFoundError(`Movement type with code ${movementTypeCode} not found`);
            }

            const originAccount = await accountSchema.findById(accountId);
            if (originAccount == null) {
                logger.error(`Account with id ${accountId} not found`);
                throw new NotFoundError(`Account with id ${accountId} not found`);
            }

            let movement;

            if (movementTypeCode === 'EXTRACTION') {
                if (amount > (originAccount.balance + originAccount.offLimitAmount)) {
                    logger.error(`Invalid amount for extraction`);
                    throw new InvalidAmountError(`Invalid amount for extraction`);
                }

                movement = new movementSchema({
                    concept: null,
                    destinyAccount: originAccount._id,
                    destinyClientId : clientId
                });

                const newBalance = originAccount.balance - Number.parseFloat(amount);
                await accountSchema.findByIdAndUpdate(originAccount._id, { balance: newBalance });
            }
            else if (movementTypeCode === 'DEPOSIT') {
                movement = new movementSchema({
                    concept: null,
                    destinyAccount: originAccount._id,
                    destinyClientId : clientId
                });

                const newBalance = originAccount.balance + Number.parseFloat(amount);
                await accountSchema.findByIdAndUpdate(originAccount._id, { balance: newBalance });
            }
            else {
                if (amount > (originAccount.balance + originAccount.offLimitAmount)) {
                    logger.error(`Invalid amount for transfer`);
                    throw new InvalidAmountError(`Invalid amount for transfer`);
                }

                const destinyAccount = await accountSchema.findOne().or([{ alias: aliasNumber }, { number: aliasNumber }]);
                if (destinyAccount == null || (destinyAccount._id == originAccount._id)){
                    logger.error(`Account with alias or number ${aliasNumber} not found`);
                    throw new NotFoundError(`Account with alias or number ${aliasNumber} not found`);
                }

                movement = new movementSchema({
                    concept: concept,
                    destinyAccount: destinyAccount._id,
                    destinyClientId : destinyAccount.client._id
                });

                const newOriginAccountBalance = originAccount.balance - Number.parseFloat(amount);
                await accountSchema.findByIdAndUpdate(originAccount._id, { balance: newOriginAccountBalance });

                const newDestinyAccountBalance = destinyAccount.balance + Number.parseFloat(amount);
                await accountSchema.findByIdAndUpdate(destinyAccount._id, { balance: newDestinyAccountBalance });
            }

            movement.creationDate = new Date();
            movement.originClientId = clientId;
            movement.movementType = movementType._id;
            movement.amount = amount;
            movement.originAccount = originAccount._id;

            await movementSchema.create(movement);

            logger.info(`End - POST /api/v1/movements, body: ${JSON.stringify(req.body)}`);
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Error saving movement. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;