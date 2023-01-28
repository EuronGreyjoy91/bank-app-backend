const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authentication');
const userTypeSchema = require('../models/userTypeModel');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/userTypes');

        try {
            const authResponse = authenticateJWT(req, res);
            if (authResponse == 401 || authResponse == 403) {
                res.sendStatus(authResponse);
                return;
            }

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