const express = require('express');
const router = express.Router();
const accountSchema = require('../models/accountModel');
const logger = require('../config/logger');

router.get('/', async (req, res) => {
    logger.debug("Some debug messages");
    
    const accounts = await accountSchema
        .find()
        .populate('client')
        .populate('accountType');

    res.json(accounts);
});

router.post('/', async (req, res) => {
    const { clientId } = req.body;

    const account = new accountSchema({
        client: clientId,
        creationDate: new Date(),
        enable: true
    });

    accountSchema.create(account);
    res.json({ status: 'Created' });
});

module.exports = router;