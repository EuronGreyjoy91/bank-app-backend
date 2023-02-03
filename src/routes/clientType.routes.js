const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authentication');
const clientTypeSchema = require('../models/clientTypeModel');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/clientTypes');

        try {
            const authResponse = authenticateJWT(req, res);
            if (authResponse == 401 || authResponse == 403) {
                res.sendStatus(authResponse);
                return;
            }
            
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