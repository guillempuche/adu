"use strict";

const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");

const University = mongoose.model("universities");

module.exports = app => {
    app.get("/api/university", requireLogin, async (req, res) => {
        try {
            const university = await University.findOne({
                _users: [req.user.id]
            });

            // If university doens't exist === null
            res.send(university);
        } catch (err) {
            console.error(err);
            res.status(500);
        }
    });
};
