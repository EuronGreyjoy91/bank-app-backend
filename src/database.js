const mongoose = require('mongoose');
const logger = require('./config/logger');

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

//const URI = 'mongodb+srv://test:12345@cluster0.fr3prkn.mongodb.net/?retryWrites=true&w=majority'
const URI = 'mongodb://127.0.0.1:27017/bankApp';

mongoose.connect(URI, connectionParams)
    .then(() => {
        logger.info('Connection to database succesufully');
    })
    .catch(() => {
        logger.error('Error connecting database');
    });


module.exports = mongoose;