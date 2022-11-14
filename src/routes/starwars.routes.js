const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', async (req, res) => {
    const result = await fetch('https://swapi.dev/api/films/1/')
        .then((response) => response.json())

    res.json(result);
});

module.exports = router;