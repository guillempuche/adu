"use strict";

const mongoose = require("mongoose");

const Client = mongoose.model("clients");

module.exports = app => {
    // ========================================
    //      NEW CLIENT
    // ========================================
    app.post("/api/client/new", async (req, res) => {
        const { client, university } = req.body;
        var exisitingClient, newClient;

        try {
            //========================================
            //      DON'T ADD NEW CLIENT IF IT EXISTS
            //========================================
            // Client is a random identifier, because we don't know the client's name.
            exisitingClient = await Client.findOne({
                clientId: client.id
            });

            if (exisitingClient) {
                res.send(exisitingClient);
            } else {
                //==================================
                //      ADD NEW CLIENT
                //==================================
                // If the client's name exist save it.
                if (client.name) {
                    newClient = await new Client({
                        clientId: client.id,
                        "personalInfo.name": client.name,
                        _university: university._id
                    }).save();
                } else {
                    newClient = await new Client({
                        clientId: client.id,
                        _university: university._id
                    }).save();
                }

                // 201 === new client created
                res.status(201).send(newClient);
            }
        } catch (err) {
            console.error(err);
            res.status(500);
        }
    });

    // ==============================================
    //      LIST OF ALL CLIENTS FROM A UNIVERSITY
    // ==============================================
    app.post("/api/client/all", async (req, res) => {
        const university = req.body;

        try {
            const clients = await Client.find({
                _university: university._id
            }).sort({ "messages.timestampUTC": -1 });

            /*
            const clients = await Client.find({
                $query: { _university: university._id },
                $orderby: { messages: { $slice: -1 } }
            });
            */

            if (clients) {
                res.send(clients);
            } else {
                // 404 === new client not found
                res.status(404);
            }
        } catch (err) {
            console.error(err);
            res.status(500);
        }
    });
};
