const express = require('express');
const router = express.Router();
const cardTypeSchema = require('../models/cardTypeModel');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/cardTypes');

        try {
            const cardTypes = await cardTypeSchema.find();

            logger.info('End - GET /api/v1/cardTypes');
            res.json(cardTypes);
        } catch (error) {
            logger.error(`Error searching card types. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;