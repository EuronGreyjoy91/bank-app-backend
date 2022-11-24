const express = require('express');
const router = express.Router();
const clientSchema = require('../models/clientModel');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/clients');

        try {
            const clients = await clientSchema.find();

            logger.info('End - GET /api/v1/clients');
            res.json(clients);
        } catch (error) {
            logger.error(`Error searching clients. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;