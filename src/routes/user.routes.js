const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const userSchema = require('../models/userModel');
const userTypeSchema = require('../models/userTypeModel');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const RepeatedUsernameError = require('../errors/RepeatedUsernameError');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info(`Start - GET /api/v1/users, query: ${JSON.stringify(req.query)}`);

        try {
            let filters = {};
            const userTypeIdFilter = req.query.userTypeId;
            if (userTypeIdFilter != undefined)
                filters.userType = userTypeIdFilter;

            const userName = req.query.userName;
            if (userName != undefined)
                filters.userName = userName;

            const users = await userSchema
                .find(filters)
                .populate('userType', 'id description')
                .select('_id userName enable creationDate')

            logger.info(`End - GET /api/v1/users, query: ${JSON.stringify(req.query)}`);
            res.json(users);
        } catch (error) {
            logger.error(`Error searching users. Error: ${error}`);
            next(error);
        }
    }
);

router.get(
    '/:userId',
    param('userId').not().isEmpty().isLength(24),
    async (req, res, next) => {
        logger.info(`Start - GET /api/v1/users/${req.params.userId}`);
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating request. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating request", errors.array());
            }

            const userId = req.params.userId;

            const user = await userSchema
                .findOne({ _id: userId })
                .populate('userType', 'id description code');

            if (user == null) {
                logger.error(`User with id ${userId} not found`);
                throw new NotFoundError(`User with id ${userId} not found`);
            }

            logger.info(`End - GET /api/v1/users/${req.params.userId}`);
            res.json(user);
        } catch (error) {
            logger.error(`Error getting user. Error: ${error}`);
            next(error);
        }
    }
);

router.post(
    '/',
    body('userName').not().isEmpty().isLength({min: 5, max: 100}),
    body('password').not().isEmpty().isLength({min: 5, max: 100}),
    body('userTypeCode').not().isEmpty(),
    async (req, res, next) => {
        logger.info(`Start - POST /api/v1/users, body: ${JSON.stringify(req.body)}`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const { userName, password, userTypeCode } = req.body;

            const userType = await userTypeSchema.findOne({code: userTypeCode});
            if (userType == null) {
                logger.error(`User type with code ${userTypeCode} not found`);
                throw new NotFoundError(`User type with code ${userTypeCode} not found`);
            }

            const repeatedUser = await userSchema.findOne({ userName: userName });
            if (repeatedUser != null) {
                logger.error(`Repeated userName. Cannot use username ${userName}`);
                throw new RepeatedUsernameError(`Repeated userName. Cannot use username ${userName}`);
            }

            const newUser = {
                userName: userName,
                password: password,
                userType: userType._id,
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

router.patch(
    '/:userId',
    param('userId').not().isEmpty().isLength(24),
    body('userName').not().isEmpty().isLength({min: 5, max: 100}),
    body('enable').optional().isBoolean(),
    async (req, res, next) => {
        logger.info(`Start - PATCH /api/v1/users/${req.params.userId}, body: ${JSON.stringify(req.body)}`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const userId = req.params.userId;
            const { enable, userName } = req.body;

            const repeatedUser = await userSchema.findOne({ userName: userName });
            if (repeatedUser != null && repeatedUser._id != userId) {
                logger.error(`Repeated userName. Cannot use username ${userName}`);
                throw new RepeatedUsernameError(`Repeated userName. Cannot use username ${userName}`);
            }

            const newValues = {
                userName,
                enable
            };

            if (enable != null && !enable)
                newValues.deleteDate = new Date()
            else if (enable != null && enable)
                newValues.deleteDate = null;

            await userSchema.findByIdAndUpdate(userId, newValues);

            logger.info(`End - PATCH /api/v1/users/${req.params.userId}, body: ${JSON.stringify(req.body)}`);
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Error on update user. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;