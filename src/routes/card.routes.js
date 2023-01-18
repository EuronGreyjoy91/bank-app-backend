const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const cardSchema = require('../models/cardModel');
const cardTypeSchema = require('../models/cardTypeModel');
const accountSchema = require('../models/accountModel');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const RepeatedCardError = require('../errors/RepeatedCardError');
const logger = require('../config/logger');

router.post(
    '/',
    body('accountId').not().isEmpty().isLength(24),
    body('cardTypeId').not().isEmpty().isLength(24),
    async (req, res, next) => {
        logger.info(`Start - POST /api/v1/cards, body: ${JSON.stringify(req.body)}`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const { accountId, cardTypeId } = req.body;

            const account = await accountSchema.findById(accountId);
            if (account == null) {
                logger.error(`Account with id ${accountId} not found`);
                throw new NotFoundError(`Account with id ${accountId} not found`);
            }

            const cardType = await cardTypeSchema.findById(cardTypeId);
            if (cardType == null) {
                logger.error(`Card type with id ${cardTypeId} not found`);
                throw new NotFoundError(`Card type with id ${cardTypeId} not found`);
            }

            const savedCard = await cardSchema.findOne({ account: accountId, cardType: cardTypeId });
            if(savedCard != null){
                logger.error(`Repeated card. Account with id ${accountId} already has a card of type id ${cardTypeId}`);
                throw new RepeatedCardError(`Repeated card. Account with id ${accountId} already has a card of type id ${cardTypeId}`);
            } 

            const card = new cardSchema({
                account: accountId,
                cardType: cardTypeId,
                number: "1234456778991234",
                expirationDate: "09/28",
                creationDate: new Date(),
                enable: true,
                deleteDate: null
            });

            await cardSchema.create(card);

            logger.info(`End - POST /api/v1/cards, body: ${JSON.stringify(req.body)}`);
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Error saving card. Error: ${error}`);
            next(error);
        }
    }
);


module.exports = router;