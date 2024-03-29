const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authentication');
const accountTypeSchema = require('../models/accountTypeModel');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/accountTypes');

        try {
            const authResponse = authenticateJWT(req, res);
            if (authResponse == 401 || authResponse == 403) {
                res.sendStatus(authResponse);
                return;
            }

            const accountTypes = await accountTypeSchema.find();

            logger.info('End - GET /api/v1/accountTypes');
            res.json(accountTypes);
        } catch (error) {
            logger.error(`Error searching account types. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;