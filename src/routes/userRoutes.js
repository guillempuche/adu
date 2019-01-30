"use strict";

const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const { deleteUserGoogleAccountId } = require("../utils/cleanData");

const User = mongoose.model("users");
const University = mongoose.model("universities");

module.exports = app => {
    app.post("/api/user/university/new", requireLogin, async (req, res) => {
        const { universityName } = req.body;
        var existingUniversity, newUniversity, user;

        // We check if user has one university assigned to him. If true, we update the name if he changes it.
        try {
            existingUniversity = await University.findOneAndUpdate(
                // Conditions
                { _users: [req.user.id] },
                // Update
                { name: universityName },
                // Mongoose options
                {
                    new: true, // return the modified document rather than the original
                    upsert: true, // creates the object if it doesn't exist
                    // add the document to the collection if any result was found
                    setDefaultsOnInsert: true, // if this and upsert are true, mongoose will apply the
                    // defaults specified in the model's schema if a new document is created.
                    runValidators: true
                },
                // Callback
                async function(err, document) {
                    if (!err && !document) {
                        // If the document doesn't exist Create it
                        newUniversity = await new University({
                            name: universityName,
                            _users: [req.user.id]
                        }).save();
                    } else if (err) {
                        throw err;
                    }
                }
            );
        } catch (err) {
            console.error(`Error on creating a new university | ${err}`);
            res.status(500);
        }

        try {
            // Update user's university
            user = await User.findByIdAndUpdate(req.user.id, {
                _university: existingUniversity._id || newUniversity._id
            });

            // Clean data before expose it to the client side.
            user = deleteUserGoogleAccountId(user);

            res.send(user);
        } catch (err) {
            console.error(err);
            res.status(500);
        }

        try {
            // If university doesn't exist, we create a new one.
            if (!existingUniversity) {
                const newUniversity = await new University({
                    name: universityName,
                    _users: [req.user.id]
                }).save();

                user = await User.findByIdAndUpdate(
                    req.user.id,
                    {
                        _university: newUniversity._id
                    },
                    {
                        new: true // return the modified document rather than the original
                    }
                );

                // Clean data before expose it to the client side.
                user = deleteUserGoogleAccountId(user);

                res.send(existingUser);
            }
        } catch (err) {
            console.error(err);
            res.status(500);
        }
    });

    app.post("/api/user/email/new", requireLogin, async (req, res) => {
        const { newEmail } = req.body;

        try {
            var user = await User.findByIdAndUpdate(
                req.user.id,
                {
                    "personalInfo.defaultEmail": newEmail
                },
                // Options
                {
                    new: true, // return the modified document rather than the original
                    upsert: true // creates the object if it doesn't exist
                },
                // Callback
                (err, document) => {
                    if (err) throw err;
                }
            );

            user = deleteUserGoogleAccountId(user);

            res.send(user);
        } catch (err) {
            console.error(err);
            res.status(500);
        }
    });
};
