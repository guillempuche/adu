'use strict';

const express = require('express');
const jwt = require('express-jwt');
// const serverless = require('serverless-http');
const { ApolloServer } = require('apollo-server-express');
const bodyParser = require('body-parser');
// const mongoose = require('mongoose');

module.exports = ({ setMorgan, logger, auth }) => {
    // const { settingMorgan } = require('./utils/logger');

    // // Setting Mongoose
    // mongoose.connect(process.env.MONGODB_URI, {
    //     useNewUrlParser: true,
    //     // https://mongoosejs.com/docs/deprecations.html#-findandmodify-
    //     useFindAndModify: false
    // });

    require('./utils/passport');

    const app = express(); // Port for the web app
    app.use(bodyParser.json());

    // ===============================================
    //          LOGGERS
    // ===============================================
    // HTTP request logger.
    settingMorgan(app);
    const logger = require('./utils/logger').logger(__filename);

    // // ===============================================
    // //          GRAPHQL
    // // ===============================================
    // const typeDefs = require('./graphql/typeDefs');
    // const resolvers = require('./graphql/resolvers');
    // const server = new ApolloServer({
    //     typeDefs,
    //     resolvers,
    //     logger: { log: e => logger.error(e) }
    // });

    // server.applyMiddleware({ app, path: '/api/graphql' });

    app.use(
        '/api',
        jwt({
            secret: process.env.EXPRESS_JWT_SECRET,
            audience: process.env.AUTH0_API_AUDIENCE
        }).unless({ path: ['/api/public'] })
    );

    app.get('/hi', (req, res) => {
        res.send('hola');
    });

    // ==============================================
    //          EXPRESS APP MIDDLEWARES
    // ==============================================
    // Initialitzing authentication and cookie middlewares.
    require('./utils/logger').errorHandler(app); // Main error handler
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

    return app;

    // module.exports.handler = serverless(app);
};
