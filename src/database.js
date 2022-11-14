const mongoose = require('mongoose');

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

//const URI = 'mongodb+srv://test:12345@cluster0.fr3prkn.mongodb.net/?retryWrites=true&w=majority'
const URI = 'mongodb://127.0.0.1:27017';

mongoose.connect(URI, connectionParams)
    .then(() => {
        console.log('Connection to database succesufully');
    })
    .catch(() => {
        console.log('Error connecting database');
    });


module.exports = mongoose;