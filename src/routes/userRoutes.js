/**
 * API for users information.
 *
 * Methods:
 * - `get /api/users/all`
 * - `post /api/users/edit`
 */
'use strict';

const _ = require('lodash');
const $ = require('mongo-dot-notation');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

const logger = require('../utils/logger').logger(__filename);
const requireLogin = require('../middlewares/requireLogin');

const User = mongoose.model('users');

module.exports = app => {
    /**
     * Get all users list filtered according to user permission:
     * - Superadmin: get all users.
     * - Admin: get users only from his faculty.
     *
     * We will return and array of only this fields: `displayName`,
     * `email`, `profilePicture`, `userType`, `university` and
     * `faculties[]`.
     */
    app.get('/api/users/all', requireLogin, async (req, res) => {
        const { user } = req;

        try {
            var users, usersId;

            // If user isn't 'superadmin'.
            if (user.userType.superadmin === false) {
                /**
                 * Return all users only with the field and set them to 1 in
                 * the projection document. And set it to 0 to exclude the field.
                 * More info: https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/#return-specific-fields-in-embedded-documents
                 *
                 * Then populate each user with the Faculty collection.
                 * More info: https://mongoosejs.com/docs/populate.html
                 */
                users = await User.find(
                    {
                        _faculties: [user._faculties[0].id]
                    },
                    {
                        'personalInfo.name.displayName': 1,
                        'personalInfo.emails': 1,
                        role: 1,
                        _faculties: 1,
                        userType: 1
                    }
                ).populate('_faculties');
            } else {
                users = await User.find(
                    {},
                    {
                        'personalInfo.name.displayName': 1,
                        'personalInfo.emails': 1,
                        role: 1,
                        _faculties: 1,
                        userType: 1
                    }
                ).populate('_faculties');
            }

            if (users.length === 0) throw Error('Users array is empty');

            // Get all users's id.
            usersId = users.map(user => user._id);

            res.send({ users, usersId });
        } catch ({ message }) {
            // 404 === Not found
            logger.error(
                `#API statusCode=404 Error on fetching all user list by user=${
                    user._id
                } - ${message}`
            );
            res.send([]);
        }
    });

    /**
     * Change data for a user. Then return all users list.
     */
    app.put('/api/users/:userId/edit', requireLogin, async (req, res) => {
        /**
         * @typedef {string} userId - User's id to know which user we have to modify.
         * @typedef {string} [displayName=undefined] - New user's name.
         * @typedef {string} [otherEmail=undefined] - New user's email.
         * @typedef {string} [role=undefined] - New user's role.
         */
        const { userId } = req.params;
        const { name, email, role } = req.body;

        /**
         * Transform objects to mongo update instructions.
         *
         * Output sample:
         *  `$ Object {$set: Object {personalInfo.name.displayName: "guillem", personalInfo.email.account: "guillem@email.com"}}`
         *
         * @typedef {Object} operator={} - User values to update.
         */
        let operator = {};

        // Update the operator if some Form's values are `undefined`,
        // they won't updated on the database.
        if (name) _.merge(operator, { 'personalInfo.name.displayName': name });
        if (email) _.merge(operator, { 'personalInfo.emails.account': email });
        if (role) _.merge(operator, { role });

        operator = $.flatten(operator);

        try {
            const userUpdated = await User.findOneAndUpdate(
                { _id: userId },
                operator,
                {
                    // Return the modified document rather than the original.
                    new: true,
                    // Update validators validate the update operation against the model's schema.
                    runValidators: true
                }
            );

            res.send(userUpdated);
        } catch (err) {
            logger.error(
                `#API statusCode=500 Error on updating the user=${userId} edited by user=${
                    req.user._id
                } - ${err}`
            );

            res.send(false);
        }
    });

    /**
     * Link a faculty's id to the User. Return `true` if all works well.
     */
    app.post(
        '/api/users/:userId/faculties/:facultyId',
        requireLogin,
        async (req, res) => {
            /**
             * @typedef {string} code - Faculty´s id to be linked.
             */
            const { userId, facultyId } = req.params;

            try {
                /**
                 * SAFE: only users who hasn't linked to any faculty will call this
                 * route, but for safety we don't update the faculty'id of the user if
                 * it already exists.
                 */
                await User.findOne({
                    _id: userId,
                    _faculties: ObjectId(facultyId)
                }).then(async user => {
                    if (user !== true) {
                        await User.findOneAndUpdate(
                            { _id: userId },
                            { $push: { _faculties: ObjectId(facultyId) } },
                            {
                                // Return the modified document rather than the original.
                                new: true,
                                // Update validators validate the update operation against the model's schema.
                                runValidators: true
                            }
                        );
                    }
                });

                res.send(true);
            } catch (err) {
                // 404 === not found
                logger.error(
                    `#API statusCode=404 Error on updating the facultyId=${facultyId} for the user=${userId} by user=${userId}. ${err}`
                );

                res.send(false);
            }
        }
    );
};
