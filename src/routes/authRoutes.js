/**
 * Authentication routes setting.
 *
 * Returns 2 objects: `initialize` (create session cookie via PassportJS)
 * and `routes` (authentification methods)
 */
'use strict';

const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('../config/keys');
const logger = require('../utils/logger').logger(__filename);
const requireLogin = require('../middlewares/requireLogin');
const { deleteAuth0UserId } = require('../utils/cleanData');

/**
 * Export the initialitzion of the authentication and the cookie session.
 *
 * We use: `cookieSession`, `passport.initialize` and `passport.session`.
 *
 * @param {object} app - Express application.
 */
module.exports.initialize = app => {
    /**
     * Create a new cookie session middleware with the provided options. This
     * middleware will attach the property session to 'req' (request), which provides an
     * object representing the loaded session. This session is either a new
     * session if no valid session was provided in the request, or a loaded
     * session from the request.
     *
     * Extract cookie data and assign the session object to incoming request.
     * Passport will pull user's id out of cookie data.
     *
     * Name of the cookie set by default is 'session'.
     */
    app.use(
        cookieSession({
            maxAge: 90 * 24 * 60 * 60 * 1000, // === 90 days
            // Encrypted the cookie created manually. User cannot manually change the user's id.
            keys: [keys.cookieKey]
        })
    );

    // Initialize passport.
    app.use(passport.initialize());

    /*
     * If sessions are being utilized, and a login session has been
     * established, this middleware will populate 'req.user' with the
     * current user.
     */
    app.use(passport.session());
};

/**
 * Export the authentication routes. We use passport to authenticate
 * with Auth0, and setting the callback.
 *
 * Get methods:
 * - `/auth`: start the login/signup with Auth0
 * - `/auth/callback`: catch the Auth0 callback
 * - `/api/logout`: logout = delete user data on the cookie
 * - `/api/current_user`: get current user data.
 *
 * @param {object} app - Express application.
 */
module.exports.routes = app => {
    // Start the authentication with Auth0 and request to Auth0 user profile with scope object.
    app.get(
        '/auth',
        passport.authenticate('auth0', { scope: 'openid email profile' })
    );

    app.get(
        '/auth/callback',
        passport.authenticate('auth0', {
            // Presistent login session
            session: true
            // successRedirect: "/",
            // failureRedirect: '/login'
        }),
        (req, res) => {
            if (!req.user)
                throw new Error('#login Auth0 callback has user=null');

            logger.info(
                '#login Auth0 callback successfully passed. Then redirected to "/"'
            );

            // res.send(req.user);
            res.redirect('/');
        }
    );

    app.get('/api/logout', (req, res) => {
        // logout() is attached automatically to request by Passport.
        // It takes the cookie that contains our user's id and it kill the id
        // that is in there.
        if (req.user) {
            logger.info(`#login User=${req.user.id} has logged out`);
            req.session = null;
            req.logout();
            res.redirect(
                `${keys.auth0LogoutURL}?returnTo=${keys.logoutURL}&client_id=${
                    keys.auth0ClientId
                }`
            ); // if $ res.send(req.user); === undefined
        } else {
            logger.info(`#login User=undefined already has logged out`);
            res.redirect('/');
        }
    });

    /**
     * Return all data from the user provided by the passport's cookie, but
     * we delete the Auth0 id.
     *
     * If user is logout, the `res.user` will be an empty string. We response
     * sending `false`.
     */
    app.get('/api/current_user', (req, res) => {
        if (req.user) {
            logger.info(`#API Get user data for user=${req.user.id}`);

            // Clean data before we expose it to the client server.
            var user = deleteAuth0UserId(req.user);

            res.send(user);
        } else {
            res.send(false);
        }
    });
};
