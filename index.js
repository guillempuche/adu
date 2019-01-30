"use strict";

const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const keys = require("./src/config/keys");
const path = require("path");
// Register schemas before passport.js requires it.
require("./src/models/User");
require("./src/models/University");
require("./src/models/Faculty");
require("./src/models/Client");
require("./src/utils/passport");

mongoose.connect(
    keys.mongo.uri,
    { useNewUrlParser: true }
);

const PORT = process.env.PORT || 5000;
// Different ports to separate the traffic
const app = express(); // Port for the web app
const app_bot = express(); // Port for the bot

require("./src/routes/chatRoutes")(app_bot, express);

app.use(bodyParser.json());

// ==============================================
//      EXPRESS APP MIDDLEWARES
// ==============================================

// Init all auth app.use() routes
require("./src/routes/authRoutes").initialize(app);
// Init all auth app.get() routes
require("./src/routes/authRoutes").routes(app);
require("./src/routes/userRoutes")(app);
require("./src/routes/universityRoutes")(app);
require("./src/routes/clientRoutes")(app);

// ===============================================

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));

    // If we don't understand what request is looking for, then look in index.html,
    // and we assume that the React Router is responsible for this route.
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
} else {
    // When server redirect to route '/', we say to Express the change the React's localhost.
    app.get("/*", (req, res) => {
        res.redirect("http://localhost:3000");
    });
}

app.listen(PORT, () => {
    console.log("App server on port %s", PORT);
});
