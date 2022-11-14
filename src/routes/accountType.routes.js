const express = require('express');
const router = express.Router();
const accountTypeRepository = require('../models/accountTypeModel');

router.get('/', async (req, res) => {
    const accountTypes = await accountTypeRepository.find();
    res.json(accountTypes);
});

module.exports = router;