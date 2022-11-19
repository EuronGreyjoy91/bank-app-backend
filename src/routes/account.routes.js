const express = require('express');
const router = express.Router();
const accountRepository = require('../models/accountModel');

router.get('/', async (req, res) => {
    const accounts = await accountRepository.find().populate('client', 'name enable');
    res.json(accounts);
});

router.post('/', async (req, res) => {
    const { clientId } = req.body;

    const account = new accountRepository({
        client: clientId,
        creationDate: new Date(),
        enable: true
    });

    accountRepository.create(account);
    res.json({status: 'Created'});
});

module.exports = router;