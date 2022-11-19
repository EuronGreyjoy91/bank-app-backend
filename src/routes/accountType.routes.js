const express = require('express');
const router = express.Router();
const accountTypeSchema = require('../models/accountTypeModel');

router.get('/', async (req, res) => {
    const accountTypes = await accountTypeSchema.find();
    res.json(accountTypes);
});

module.exports = router;