/**
 * Passport configuration.
 *
 * We do:
 * - storing the user data to the cookie
 * - setting the Auth0 Passport strategy to be able to login/signup.
 */
'use strict';

const mongoose = require('mongoose');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const keys = require('../config/keys');
const logger = require('../utils/logger').logger(__filename);

const User = mongoose.model('users');

// =======================================
//          STORING & RETRIEVING USER DATA FROM THE SESSION
// =======================================
/**
 * Passport will maintain persistent login sessions. In order for persistent
 * sessions to work, the authenticated user must be serialized to the session
 * and deserialized when subsequent requests are made.
 *
 * Here, we serialize the user ID and find the user by ID when deserializing.
 *
 * Serialize user object (originated on Passport strategy) to set in the
 * session cookie.
 */
passport.serializeUser((user, done) => {
    // user.id === MongoDB user id
    done(null, user.id); // null === no errors
});

/**
 * Deserialize user object from the cookie. Turn user's id into a user.
 * User model instance is added to req object as 'req.user'
 * id === user.id from serializeUser()
 */
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});
// =========================================

/**
 * Setting the Passport strategy to connect to authentication provider Auth0.
 *
 * Before authenticating requests, the strategy used by an
 * application must be configured.
 */
passport.use(
    new Auth0Strategy(
        {
            domain: keys.auth0Domain,
            clientID: keys.auth0ClientId,
            clientSecret: keys.auth0ClientSecret,
            // Callback URL where user will be redirected after Auth0 gives
            // us permission.
            callbackURL: keys.auth0CallbackURL
            //proxy: true
        },
        // Callback that is will be executed when Get user details after
        // callback is called.
        async (accessToken, refreshToken, extraParams, profile, done) => {
            try {
                if (!profile.id)
                    throw Error(
                        'Profile argument from Auth0 Strategy callback is empty'
                    );
                else {
                    /**
                     * Check if user's Google id exists. We don't check e-mail or
                     * similars things because.
                     *
                     * The user's account variables can change overtime, except for
                     * user's id.
                     */
                    const user = await User.findOne({
                        auth: { auth0UserId: profile.user_id }
                    });

                    // If user alreeady exist on the database, then return the details
                    // found about it.
                    if (user) {
                        logger.info(
                            `#login User=${
                                user.id
                            } found on the database. Not required to save a new user.`
                        );
                        return done(null, user); // null === no errors
                    }

                    const newUser = await new User({
                        auth: {
                            auth0UserId: profile.user_id
                        },
                        personalInfo: {
                            name: {
                                nickName: profile.nickname,
                                displayName: profile.displayName,
                                givenName: profile.name.givenName,
                                familyName: profile.name.familyName
                            },
                            email: { default: profile.emails[0].value },
                            profilePicture: profile.picture
                        }
                    }).save();

                    logger.info(`#login New user=${newUser.id} is signup`);

                    done(null, newUser);
                }
            } catch ({ message }) {
                logger.error(`#login ${message}`);
            }
        }
    )
);
