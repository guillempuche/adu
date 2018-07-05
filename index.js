"use strict";

const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const keys = require("./src/config/keys");
require("./src/models/User"); // Register user schema before passport.js requires it.
require("./src/utils/passport");

mongoose.connect(
    keys.mongo.uri,
    { useNewUrlParser: true }
);

const PORT = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json());

// ==================
//      Return functions
// ==================
// Init all auth app.use() routes
require("./src/routes/authRoutes").initialize(app);
// Init all auth app.get() routes
require("./src/routes/authRoutes").routes(app);

if (process.env.NODE_ENV === "production") {
    // Express serves up production assets like main.js or main.css files.
    // If we don't understand what request is looking for, then look in this directory
    // and try to see if there's the specific file.
    app.use(express.static("client/build"));

    // Express serves up index.html file if it doesn't recognize the route.
    // If we don't understand what request is looking for, then look in index.html,
    // and we assume that the React Router is responsible for this route.
    const path = require("path");
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

app.listen(PORT, () => {
    console.log("Server on port %s", PORT);
});
