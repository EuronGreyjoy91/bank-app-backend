const express = require('express');
const router = express.Router();
const userTypeSchema = require('../models/userTypeModel');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/userTypes');

        try {
            const userTypes = await userTypeSchema.find();

            logger.info('End - GET /api/v1/userTypes');
            res.json(userTypes);
        } catch (error) {
            logger.error(`Error searching user types. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;