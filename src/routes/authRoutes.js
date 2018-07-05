"use strict";

const cookieSession = require("cookie-session");
const passport = require("passport");
const keys = require("../config/keys");

// app.use() methods
module.exports.initialize = app => {
    // Extract cookie data and assign the session object to incoming request.
    // Passot will pull user id out of cookie data.
    app.use(
        cookieSession({
            maxAge: 90 * 24 * 60 * 60 * 1000, // === 90 days
            // Encrypted the cookie. User cannot manually change the user's id.
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
            // res.redirect("/surveys");
            res.send(req.user);
        }
    );

    app.get("/api/logout", (req, res) => {
        // logout() is attached automatically to request by Passport.
        // It takes the cookie that contains our user's id and it kill the id
        // that is in there.
        req.logout();
        res.redirect("/"); // if $ res.send(req.user); === undefined
    });

    app.get("/api/current_user", (req, res) => {
        res.send(req.user);
    });
};
