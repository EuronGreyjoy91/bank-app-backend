const express = require('express');
const { mongoose } = require('./database');
const logger = require('./config/logger');

const starWarsRoutes = require('./routes/starwars.routes');
const accountTypeRoutes = require('./routes/accountType.routes');
const clientTypeRoutes = require('./routes/clientType.routes');
const accountRoutes = require('./routes/account.routes');
const clientRoutes = require('./routes/client.routes');

const app = express();

//Settings
app.set('port', process.env.PORT || 4000);

//Middlewares
app.use(express.json());

//Routes
app.use('/api/v1/starwars', starWarsRoutes);
app.use('/api/v1/accountTypes', accountTypeRoutes);
app.use('/api/v1/clientTypes', clientTypeRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/clients', clientRoutes);

//Error Handler
app.use((error, req, res, next) => {
    res.status(error.status).json({
        status: error.status,
        code: error.code,
        message: error.message
    })
});

//Start server
app.listen(app.get('port'), () => {
    logger.info(`Server running on port: ${app.get('port')}`);
});