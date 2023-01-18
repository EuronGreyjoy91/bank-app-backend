const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const clientSchema = require('../models/clientModel');
const clientTypeSchema = require('../models/clientTypeModel');
const accountSchema = require('../models/accountModel');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const RepeatedDocumentError = require('../errors/RepeatedDocumentError');
const logger = require('../config/logger');

router.get(
    '/',
    async (req, res, next) => {
        logger.info(`Start - GET /api/v1/clients, query: ${JSON.stringify(req.query)}`);

        let filters = {};

        const clientTypeIdFilter = req.query.clientTypeId;
        if (clientTypeIdFilter != undefined)
            filters.clientType = clientTypeIdFilter;

        const cuitCuilFilter = req.query.cuitCuil;
        if (cuitCuilFilter != undefined)
            filters.cuitCuil = cuitCuilFilter;

        const documentFilter = req.query.document;
        if (documentFilter != undefined)
            filters.document = req.query.document;

        try {
            const clients = await clientSchema
                .find(filters)
                .populate('clientType', 'id description');

            logger.info(`End - GET /api/v1/clients, query: ${JSON.stringify(req.query)}`);
            res.json(clients);
        } catch (error) {
            logger.error(`Error searching clients. Error: ${error}`);
            next(error);
        }
    }
);

router.get(
    '/:clientId',
    param('clientId').not().isEmpty().isLength(24),
    async (req, res, next) => {
        logger.info(`Start - GET /api/v1/clients/${req.params.clientId}`);
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.error(`Error validating request. Error: ${JSON.stringify(errors.array())}`);
                throw new ValidationError("Error validating request", errors.array());
            }

            const clientId = req.params.clientId;

            const client = await clientSchema
                .findOne({ _id: clientId })
                .populate('clientType', 'id description code');

            if (client == null) {
                logger.error(`Client with id ${clientId} not found`);
                throw new NotFoundError(`Client with id ${clientId} not found`);
            }

            logger.info(`End - GET /api/v1/clients/${req.params.clientId}`);
            res.json(client);
        } catch (error) {
            logger.error(`Error getting client. Error: ${error}`);
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

            logger.info(`End - GET /api/v1/clients/${req.params.clientId}/accounts, body: ${JSON.stringify(req.body)}`);
            res.json(accounts);
        } catch (error) {
            logger.error(`Error searching accounts for client ${req.params.clientId}. Error ${error}`);
            next(error);
        }
    }
)

router.post(
    '/',
    body('name').optional().not().isEmpty().isLength({ min: 3, max: 200 }),
    body('lastName').optional().not().isEmpty().isLength({ min: 3, max: 200 }),
    body('document').optional().not().isEmpty().isLength({ min: 8, max: 8 }),
    body('businessName').optional().not().isEmpty(),
    body('adress').optional().not().isEmpty(),
    body('cuitCuil').not().isEmpty().isLength({ min: 8, max: 11 }),
    body('clientTypeCode').not().isEmpty(),
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
                adress, cuitCuil, clientTypeCode
            } = req.body;

            const clientType = await clientTypeSchema.findOne({ code: clientTypeCode });
            if (clientType == null) {
                logger.error(`Client type with code ${clientTypeCode} not found`);
                throw new NotFoundError(`Client type with code ${clientTypeCode} not found`);
            }

            const savedClient = await clientSchema.findOne().or([{ document: document }, { cuitCuil: cuitCuil }]);
            if (savedClient != null) {
                logger.error(`There is a client with document ${document} or cuit/cuil ${cuitCuil} already`);
                throw new RepeatedDocumentError(`There is a client with document ${document} or cuit/cuil ${cuitCuil} already`);
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
                clientType: clientType._id
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
    body('name').optional().isString().isLength({ min: 3, max: 200 }),
    body('lastName').optional().isString().isLength({ min: 3, max: 200 }),
    body('adress').optional().not().isEmpty(),
    body('bussinessName').optional().not().isEmpty(),
    body('document').optional().not().isEmpty().isLength({ min: 8, max: 8 }),
    body('cuitCuil').not().isEmpty().isLength({ min: 8, max: 11 }),
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
            const { name, lastName, adress, enable, businessName, document, cuitCuil } = req.body;

            const client = await clientSchema.findById(clientId);
            if (client == null) {
                logger.error(`Client with id ${clientId} not found`);
                throw new NotFoundError(`Client with id ${clientId} not found`);
            }

            if (document != null || cuitCuil != null) {
                const savedClient = await clientSchema.findOne().or([{ document: document }, { cuitCuil: cuitCuil }]);
                if (savedClient != null && savedClient._id != clientId) {
                    logger.error(`There is a client with document ${document} or cuit/cuil ${cuitCuil} already`);
                    throw new RepeatedDocumentError(`There is a client with document ${document} or cuit/cuil ${cuitCuil} already`);
                }
            }

            const newValues = {
                name,
                lastName,
                adress,
                businessName,
                document,
                cuitCuil,
                enable
            }

            if (enable != null && !enable)
                newValues.deleteDate = new Date()
            else if (enable != null && enable)
                newValues.deleteDate = null;

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