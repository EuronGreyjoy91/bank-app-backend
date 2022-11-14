const express = require('express');
const morgan = require('morgan');
const { mongoose } = require('./database');

const taskRoutes = require('./routes/task.routes');
const starWarsRoutes = require('./routes/starwars.routes');
const studentsRoutes = require('./routes/students.routes');
const studentsAndTasksRoutes = require('./routes/studentAndTasksRoutes');

const app = express();

//Settings
app.set('port', process.env.PORT || 4000);

// Middlewares
app.use(morgan('dev'));
app.use(express.json()); //Chequea que cada peticion y envio de dato sea un JSO

//Routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/starwars', starWarsRoutes);
app.use('/api/v1/students', studentsRoutes);
app.use('/api/v1/studentsAndTasks', studentsAndTasksRoutes);

// Static files

//Start server
app.listen(app.get('port'), () => {
    console.log(`Server running on port: ${app.get('port')}`);
});