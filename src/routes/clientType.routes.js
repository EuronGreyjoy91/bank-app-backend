const express = require('express');
const router = express.Router();
const clientTypeSchema = require('../models/clientTypeModel');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/clientTypes');

        try {
            const clientTypes = await clientTypeSchema.find();

            logger.info('End - GET /api/v1/clientTypes');
            res.json(clientTypes);
        } catch (error) {
            logger.error(`Error searching client types. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;