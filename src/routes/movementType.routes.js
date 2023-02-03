const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/authentication');
const movementTypeSchema = require('../models/movementTypeModel');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/movementTypes');

        try {
            const authResponse = authenticateJWT(req, res);
            if (authResponse == 401 || authResponse == 403) {
                res.sendStatus(authResponse);
                return;
            }

            const movementTypes = await movementTypeSchema.find();

            logger.info('End - GET /api/v1/movementTypes');
            res.json(movementTypes);
        } catch (error) {
            logger.error(`Error searching movement types. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;