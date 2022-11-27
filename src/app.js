const express = require('express');
const { mongoose } = require('./database');
const logger = require('./config/logger');

const starWarsRoutes = require('./routes/starwars.routes');
const accountTypeRoutes = require('./routes/accountType.routes');
const clientTypeRoutes = require('./routes/clientType.routes');
const accountRoutes = require('./routes/account.routes');
const clientRoutes = require('./routes/client.routes');
const movementTypeRoutes = require('./routes/movementType.routes');

const app = express();

//Settings
app.set('port', process.env.PORT || 4000);

//Middlewares
app.use(express.json());

//Routes
const basePath = '/api/v1';

app.use(`${basePath}/starwars`, starWarsRoutes);
app.use(`${basePath}/accountTypes`, accountTypeRoutes);
app.use(`${basePath}/clientTypes`, clientTypeRoutes);
app.use(`${basePath}/accounts`, accountRoutes);
app.use(`${basePath}/clients`, clientRoutes);
app.use(`${basePath}/movementTypes`, movementTypeRoutes);

//Default Route
app.use(function (req, res) {
    res.status(404).json({
        status: 404,
        code: "INVALID_URL",
        message: "URL not found"
    })
});


//Error Handler
app.use((error, req, res, next) => {
    const errorResponse = {
        status: error.status,
        code: error.code,
        message: error.message
    }

    if (error.errors != null)
        errorResponse.errors = error.errors;

    res.status(error.status).json(errorResponse);
});

//Start server
app.listen(app.get('port'), () => {
    logger.info(`Server running on port: ${app.get('port')}`);
});