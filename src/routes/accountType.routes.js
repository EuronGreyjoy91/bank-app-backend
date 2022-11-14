const express = require('express');
const router = express.Router();
const AccountType = require('../models/accountTypeModel');

router.get('/', async (req, res) => {
    const accountTypes = await AccountType.find();
    res.json(accountTypes);
});

module.exports = router;