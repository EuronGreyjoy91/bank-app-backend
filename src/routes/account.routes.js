const express = require('express');
const router = express.Router();
const accountSchema = require('../models/accountModel');

router.get('/', async (req, res) => {
    const accounts = await accountSchema.find().populate('client', 'name enable');
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