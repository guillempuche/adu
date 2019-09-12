/**
 * Root file for setting the backend.
 */
'use strict';

const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const bodyParser = require('body-parser');
const {
    // stackifyUncaughtException,
    settingMorgan
} = require('./utils/logger');
// stackifyUncaughtException;

// Setting Mongoose
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    // https://mongoosejs.com/docs/deprecations.html#-findandmodify-
    useFindAndModify: false
});

// // Register schemas before Passport or API requests require them.
// mongoose.models.users || require('./models/User');
// mongoose.models.faculties || require('./models/Faculty');
// mongoose.models.clients || require('./models/Client');
// mongoose.models.rooms || require('./models/Room');
// mongoose.models.messages || require('./models/Message');
// mongoose.models.questions || require('./models/Question');
// mongoose.models.appSettings || require('./models/AppSettings');
require('./utils/passport');

const app = express(); // Port for the web app
app.use(bodyParser.json());

// ===============================================
//          LOGGERS
// ===============================================
// HTTP request logger.
settingMorgan(app);
const logger = require('./utils/logger').logger(__filename);

// ===============================================
//          GRAPHQL
// ===============================================
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const server = new ApolloServer({
    typeDefs,
    resolvers,
    logger: { log: e => logger.error(e) }
});

server.applyMiddleware({ app, path: '/api/graphql' });

app.get('/hi', (req, res) => {
    res.send('hola');
});

// ==============================================
//          EXPRESS APP MIDDLEWARES
// ==============================================
// Initialitzing authentication and cookie middlewares, they're
// the app.use() routes.
require('./routes/authRoutes').initialize(app); // Start cookies & Passport.
// Init all auth app.get() routes
require('./routes/authRoutes').routes(app);
require('./routes/userRoutes')(app);
require('./routes/facultyRoutes')(app);
require('./routes/clientRoutes')(app);
require('./routes/roomRoutes')(app);
require('./routes/messageRoutes')(app);
require('./routes/chatRoutes')(app);
require('./routes/appSettingsRoutes')(app);
require('./utils/logger').errorHandler(app); // Main error handler
// ===============================================

app.get('/', (req, res) => {
    res.send('Hi');
});

// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static('client/build'));

//     // If we don't understand what request is looking for, then look in index.html,
//     // and we assume that the React Router is responsible for this route.
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//     });
// } else {
//     // When server redirect to route '/', we say to Express the change the React's localhost.
//     app.get('/*', (req, res) => {
//         res.redirect('http://localhost:3000');
//     });
// }

module.exports.handler = serverless(app);
