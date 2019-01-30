"use strict";

const cookieSession = require("cookie-session");
const passport = require("passport");
const keys = require("../config/keys");
const { deleteUserGoogleAccountId } = require("../utils/cleanData");

// app.use() methods
module.exports.initialize = app => {
    // Extract cookie data and assign the session object to incoming request.
    // Passot will pull user id out of cookie data.
    app.use(
        cookieSession({
            maxAge: 90 * 24 * 60 * 60 * 1000, // === 90 days
            // Encrypted the cookie created manually. User cannot manually change the user's id.
            keys: [keys.cookieKey]
        })
    );

    app.use(passport.initialize());

    /*
     * If sessions are being utilized, and a login session has been established,
     * this middleware will populate `req.user` with the current user.
    */
    app.use(passport.session());
};

// app.get() methods
module.exports.routes = app => {
    app.get(
        "/auth/google",
        passport.authenticate("google", {
            scope: ["profile", "email"]
        })
    );

    app.get(
        "/auth/google/callback",
        passport.authenticate("google", {
            // successRedirect: "/",
            // failureRedirect: "/login"
            // Presistent login session
            session: true
        }),
        (req, res) => {
            // res.send(req.user);
            res.redirect("/app");
        }
    );

    app.get("/api/logout", (req, res) => {
        // logout() is attached automatically to request by Passport.
        // It takes the cookie that contains our user's id and it kill the id
        // that is in there.
        req.logout();
        res.redirect("/login"); // if $ res.send(req.user); === undefined
    });

    // IMPORTANT: if user is logout, the 'res.user' will be an empty string.
    app.get("/api/current_user", (req, res) => {
        if (req.user !== undefined) {
            // Clean data before expose it to the client side.
            var user = deleteUserGoogleAccountId(req.user);

            res.status(200).send(user);
        } else {
            // 404 === user not found
            res.status(404).send("");
        }
    });
};
