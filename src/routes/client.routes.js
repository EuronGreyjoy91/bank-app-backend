const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const clientSchema = require('../models/clientModel');
const clientTypeSchema = require('../models/clientTypeModel');
const accountSchema = require('../models/accountModel');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const RepeatedError = require('../errors/RepeatedError');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info('Start - GET /api/v1/clients');

        try {
            const clients = await clientSchema
                .find()
                .populate('clientType', 'id description');

            logger.info('End - GET /api/v1/clients');
            res.json(clients);
        } catch (error) {
            logger.error(`Error searching clients. Error: ${error}`);
            next(error);
        }
    }
);

router.get(
    '/:clientId/accounts',
    param('clientId').not().isEmpty().isLength(24),
    async (req, res, next) => {
        logger.info(`Start - GET /api/v1/clients/${req.params.clientId}/accounts, body: ${JSON.stringify(req.body)}`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const clientId = req.params.clientId;
            const savedClient = await clientSchema.findById(clientId);
            if (savedClient == null) {
                logger.error(`Client with id ${clientId} not found`);
                throw new NotFoundError(`Client with id ${clientId} not found`);
            }

            const accounts = await accountSchema
                .find({ clientId: clientId })
                .populate('client', 'id name')
                .populate('accountType', 'id description');

            res.json(accounts);
        } catch (error) {
            logger.error(`Error searching accounts for client ${req.params.clientId}. Error ${error}`);
            next(error);
        }
    }
)

router.post(
    '/',
    body('name').optional().not().isEmpty(),
    body('lastName').optional().not().isEmpty(),
    body('document').optional().not().isEmpty(),
    body('businessName').optional().not().isEmpty(),
    body('adress').not().isEmpty(),
    body('cuitCuil').not().isEmpty(),
    body('clientTypeId').not().isEmpty().isLength(24),
    async (req, res, next) => {
        logger.info(`Start - POST /api/v1/clients, body: ${JSON.stringify(req.body)}`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const {
                name, lastName, document, businessName,
                adress, cuitCuil, clientTypeId
            } = req.body;

            const clientType = await clientTypeSchema.findById(clientTypeId);
            if (clientType == null) {
                logger.error(`Client type with id ${clientTypeId} not found`);
                throw new NotFoundError(`Client type with id ${clientTypeId} not found`);
            }

            const savedClient = await clientSchema.findOne().or([{ document: document }, { cuitCuil: cuitCuil }]);
            if (savedClient != null) {
                logger.error(`There is a client with document ${document} or cuit/cuil ${cuitCuil} already`);
                throw new RepeatedError(`There is a client with document ${document} or cuit/cuil ${cuitCuil} already`);
            }

            const newClient = new clientSchema({
                name: name,
                lastName: lastName,
                document: document,
                businessName: businessName,
                adress: adress,
                cuitCuil: cuitCuil,
                creationDate: new Date(),
                enable: true,
                deleteDate: null,
                clientType: clientTypeId
            });

            await clientSchema.create(newClient);

            logger.info(`End - POST /api/v1/clients, body: ${JSON.stringify(req.body)}`);
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Error saving client. Error: ${error}`);
            next(error);
        }
    }
);

router.patch(
    '/:clientId',
    param('clientId').not().isEmpty().isLength(24),
    body('name').optional().isString(),
    body('lastName').optional().isString(),
    body('adress').optional().not().isEmpty(),
    body('enable').optional().isBoolean(),
    async (req, res, next) => {
        logger.info(`Start - PATCH /api/v1/clients/${req.params.clientId}, body: ${JSON.stringify(req.body)}`);

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating body. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating body", errors.array());
            }

            const clientId = req.params.clientId;
            const { name, lastName, adress, enable } = req.body;

            const client = await clientSchema.findById(clientId);
            if (client == null) {
                logger.error(`Client with id ${clientId} not found`);
                throw new NotFoundError(`Client with id ${clientId} not found`);
            }

            const newValues = {
                name,
                lastName,
                adress,
                enable
            }

            await clientSchema.findByIdAndUpdate(clientId, newValues);

            logger.info(`End - PATCH /api/v1/clients/${req.params.clientId}, body: ${JSON.stringify(req.body)}`);
            res.json({ status: 'OK' });
        } catch (error) {
            logger.error(`Error on update client. Error: ${error}`);
            next(error);
        }
    }
);

module.exports = router;