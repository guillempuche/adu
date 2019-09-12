/**
 * API for client information.
 *
 * Methods:
 * - `get /api/client/:uuid`
 * - `post /api/client/:uuid`
 * - `get /api/client/:id`
 */
'use strict';

const _ = require('lodash');
const $ = require('mongo-dot-notation');
const { ObjectId } = require('mongoose').Types;
const logger = require('../utils/logger').logger(__filename);
const { getClientCookie } = require('../utils/clientCookie');

const Client = require('../models/Client');

module.exports = app => {
    /**
     * Fetch client or create if it doesn't exist. We will check it
     * in the database "Client" and in the cookie.
     *
     *
     * If a client (user who uses the faculty chat) uses AU service
     * for the first time in a browser, we generate a random UUID for
     * that particula faculty.
     * Because we will know if the cient is already used the faculty's chat.
     *
     * We want to prevent the same client UUID for multiple faculties chat.
     * Hence, the client has a unique UUID for every faculty chat
     * and he hasn't interconnected chat history...
     *
     * This cookie will be able to throught the Express middlewares.
     *
     * @return {?Object} - Client or `null` if there's some error.
     */
    app.get('/api/public/clients', async (req, res) => {
        const { facultyId } = req.query;
        let client = {};

        /**
         * Getting the cookie.
         *
         * @typedef {array} browserUser - A cookie to know if the client is
         * new or it has already used the faculty's chat.
         * @typedef {string} browserUser[].facultyId
         * @typedef {string} browserUser[].clientId - The brwoser's user can have
         * multiple clients. Every client will will associeted to a different
         * faculty === different faculty chat.
         */
        let browserUser = req.signedCookies['browserUser'];
        const cookieConfig = {
            maxAge: 730 * 24 * 60 * 60 * 60, // === 2 years.
            signed: true // We use a secret key for the Cookie Parser.
        };

        try {
            // Throw error if the data receive is incorrect.
            if (!facultyId)
                throw Error(`Insufficient data: facultyId=${facultyId}.`);

            // Find the client's cookie.
            let clientCookie = getClientCookie(
                req.signedCookies,
                'faculty',
                facultyId
            );

            // Check if the client exists on the cookie. Else, we delete
            // the cookie of the client fetched.
            if (clientCookie) {
                client = await Client.findOne({
                    _id: clientCookie.clientId,
                    _faculty: clientCookie.facultyId
                })
                    .populate('_faculty', '_id')
                    .populate('rooms');
            } else {
                let index = _.findIndex(browserUser, { facultyId });

                // If it exists, we delete the cookie (an object) from all cookies.
                if (index !== -1) {
                    browserUser.splice(index, 1);
                    res.cookie('browserUser', browserUser, cookieConfig);
                }
            }

            // If client isn't found on database, then restart the Client's cookie.
            if (_.isEmpty(client)) {
                // Create a new user if he doesn't already exist.
                client = await new Client({
                    _faculty: new ObjectId(facultyId)
                }).save();

                /**
                 * On the found object, we want only faculty's id and all rooms
                 * information.
                 */
                // client = await Client.findById(client.id).populate(
                //     '_faculty',
                //     '_id'
                // );

                // Create the new client cookie for the actual faculty's chat.
                clientCookie = {
                    clientId: client.id,
                    facultyId
                };

                /**
                 * Register the new client and faculty for the browser's user.
                 *
                 * We create the `browserUser` cookie if it doesn't exist.
                 * Else, we add the new Client's cookie to the existing
                 * Client's cookie array.
                 */
                if (!browserUser) {
                    res.cookie('browserUser', [clientCookie], cookieConfig);
                } else {
                    browserUser.push(clientCookie);
                    res.cookie('browserUser', browserUser, cookieConfig);
                }
            }

            // If the client is on the database, we return him.
            if (_.isEmpty(client))
                throw Error('The client fetched on database is empty.');
            else res.send(client);
        } catch (err) {
            logger.error(
                `#API Problem with fetching the client (facultyId=${facultyId}). ${err}`
            );

            // Bad Request
            res.status(400).send(null);
        }
    });

    /**
     * Set a Client's attribute. It can be a new attribute.
     *
     * @callback @param {Array} req.body.attributes Attributes to be saved.
     * @callback @param {string} req.body.attributes.email An attribute.
     * @return {Object} Client updated.
     */
    app.post('/api/public/clients/:clientId/attributes', async (req, res) => {
        const { clientId } = req.params;
        const { attributes } = req.body;

        try {
            const operator = $.flatten({
                attributes
            });

            const client = await Client.findByIdAndUpdate(clientId, operator, {
                // Return the modified document.
                new: true,
                // To turn on update validators for update oprations.
                runValidators: true
            });

            res.send(client);
        } catch (err) {
            logger.error(
                `#API Error on setting the attribute=${JSON.stringify(
                    attributes
                )} in clientId=${clientId}. ${err}`
            );

            // Bad Request
            res.status(400).send(false);
        }
    });
};
