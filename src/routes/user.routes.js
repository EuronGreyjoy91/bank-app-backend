const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userSchema = require('../models/userModel');
const userTypeSchema = require('../models/userTypeModel');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const RepeatedError = require('../errors/RepeatedError');
const logger = require('../config/logger');

router.post(
    '/',
    body('userName').not().isEmpty(),
    body('password').not().isEmpty(),
    body('userTypeId').not().isEmpty().isLength(24),
    async (req, res, next) => {
        logger.info(`Start - POST /api/v1/users, body: ${JSON.stringify(req.body)}`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const { userName, password, userTypeId } = req.body;

            const userType = await userTypeSchema.findById(userTypeId);
            if (userType == null) {
                logger.error(`User type with id ${userTypeId} not found`);
                throw new NotFoundError(`User type with id ${userTypeId} not found`);
            }

            const repeatedUser = await userSchema.findOne({ userName: userName });
            if (repeatedUser != null) {
                logger.error(`Repeated userName. Cannot use username ${userName}`);
                throw new RepeatedError(`Repeated userName. Cannot use username ${userName}`);
            }

            const newUser = {
                userName: userName,
                password: password,
                userType: userTypeId,
                creationDate: new Date(),
                enable: true,
                deleteDate: null
            }

            await userSchema.create(newUser);

            logger.info(`End - POST /api/v1/users, body: ${JSON.stringify(req.body)}`);
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Error saving user. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;