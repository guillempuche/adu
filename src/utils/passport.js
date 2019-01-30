"use strict";

const _ = require("lodash");
const keys = require("../config/keys");
const mongoose = require("mongoose");
const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20/lib").Strategy;

const User = mongoose.model("users");

// Serialize user object (originated on Passport strategy) to set the session cookie.
passport.serializeUser((user, done) => {
    // user.id === MongoDB user id
    done(null, user.id); // null === no errors
});

/**
 * Deserialize user object from the cookie. Turn user id into a user.
 * User model instance is added to req object as 'req.user'
 * id === user.id from serializeUser()
 */
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.google.clientId,
            clientSecret: keys.google.clientSecret,
            // URL where user will be redirected after he gives permission to Google
            // to we can use his information.
            callbackURL: "/auth/google/callback",
            proxy: true
        },
        // Callback that is will be executed when Get user details after callback is called
        async (accessToken, refreshToken, profile, done) => {
            // Check if user's Google id exists. We don't check e-mail or similars things because
            // the user's Google account variables can change overtime, except for user's id.
            var user = await User.findOne({ auth: { googleId: profile.id } });

            if (user) {
                return done(null, user); // null === no errors
            }

            // Filter the string, ie: https://lh3.googleusercontent.com/.../photo.jpg?sz=50
            const profileImage = _.split(profile.photos[0].value, "?sz")[0];

            var newUser = await new User({
                auth: {
                    googleId: profile.id
                },
                personalInfo: {
                    fullName: profile.displayName,
                    firstName: profile.name.givenName,
                    googleEmail: profile.emails[0].value,
                    profilePicture: profileImage
                }
            }).save();

            done(null, newUser);
        }
    )
);
