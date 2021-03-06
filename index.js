/**
 * Root file for setting the backend.
 */
'use strict';

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const keys = require('./src/config/keys');
const {
    stackifyUncaughtException,
    settingMorgan
} = require('./src/utils/logger');

// Register schemas before Passport or API requests require them.
require('./src/models/User');
require('./src/models/Faculty');
require('./src/models/Client');
require('./src/models/Room');
require('./src/models/Message');
require('./src/utils/passport');

// Setting Mongoose
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    // https://mongoosejs.com/docs/deprecations.html#-findandmodify-
    useFindAndModify: false
});

// Setting the port
const PORT = process.env.PORT || 5000;

// Different ports to separate the traffic
const app = express(); // Port for the web app
app.use(bodyParser.json());

// ===============================================
//          LOGGERS
// ===============================================
// HTTP request logger.
settingMorgan(app);
require('./src/utils/logger').logger(__filename);
stackifyUncaughtException;

// ==============================================
//          EXPRESS APP MIDDLEWARES
// ==============================================
// Initialitzing authentication and cookie middlewares, they're
// the app.use() routes.
require('./src/routes/authRoutes').initialize(app); // Start cookies & Passport.
// Init all auth app.get() routes
require('./src/routes/authRoutes').routes(app);
require('./src/routes/userRoutes')(app);
require('./src/routes/facultyRoutes')(app);
require('./src/routes/clientRoutes')(app);
require('./src/routes/roomRoutes')(app);
require('./src/routes/messageRoutes')(app);
require('./src/routes/chatRoutes')(app);
require('./src/utils/logger').errorHandler(app); // Main error handler
// ===============================================

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    // If we don't understand what request is looking for, then look in index.html,
    // and we assume that the React Router is responsible for this route.
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
} else {
    // When server redirect to route '/', we say to Express the change the React's localhost.
    app.get('/*', (req, res) => {
        res.redirect('http://localhost:3000');
    });
}

app.listen(PORT, () => {
    console.log('App server on port ' + PORT);
});
