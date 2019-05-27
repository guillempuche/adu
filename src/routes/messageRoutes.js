/**
 * API for messages.
 *
 * Methods:
 * - `post /api/public/rooms/:roomId/messages/new`
 * - `get /api/public/rooms/:roomId/messages`
 */
'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const logger = require('../utils/logger').logger(__filename);
const { getMessageType } = require('../utils/chatUtils');

const Message = mongoose.model('messages');

module.exports = app => {
    /**
     * Save the new message to the Room database.
     *
     * IMPORTANT: We save it only when a user/client/bot sends it, now when he receives it.
     */
    app.post('/api/public/rooms/:roomId/messages/new', async (req, res) => {
        const { roomId } = req.params;
        const { sender, timetoken, data } = req.body;
        const { _id, type } = sender;
        const { lang } = data;

        try {
            // For more info about message structure, look up Message Schema.
            let message = {
                room: new ObjectId(roomId),
                sender,
                timetoken,
                data: {
                    lang,
                    type: {}
                }
            };

            // ==========================================
            //          CONVERT THE MESSAGE
            // ==========================================
            // Convert the request to be able to save on the database.
            switch (getMessageType(data.type)) {
                case 'text':
                    message.data.type.text = data.type.text;
                    break;
                case 'quickReplies':
                    // Save every quick reply from quickReplies[].
                    message.data.type.quickReplies = _.map(
                        data.type.quickReplies,
                        quickReply => {
                            const { text, goToBlocks } = quickReply;

                            return {
                                text,
                                goToBlocks
                            };
                        }
                    );
                    break;
                case 'attachment':
                    // Save every quick reply from quickReplies[].
                    message.data.type.attachment = data.type.attachment;
                    break;
                default:
                    break;
            }

            // ==========================================
            //           SAVE THE MESSAGE
            // ==========================================
            /**
             * Steps to save the new message:
             *
             *      1) Replace the message on database with the new one if it is: a Quick Reply or is duplicated.
             *      2) If we can't find a Quick Reply or a duplication, we save as a new message (without replacement).
             */
            const options = {
                // If the query (a Quick Reply exists or the message is duplicated), we replace the whole document.
                overwrite: true,
                // If the query isn't passed, we save the message as new.
                upsert: true,
                // Validate the message against the model's schema.
                runValidators: true
                // // Return the updated document.
                // new: true
            };

            Message.findOneAndUpdate(
                {
                    room: roomId,
                    $or: [
                        { 'data.type.quickReplies': { $exists: true } },
                        {
                            $and: [
                                { sender: message.sender },
                                {
                                    timetoken: {
                                        $gt: message.timetoken - 500,
                                        $lt: message.timetoken + 500
                                    }
                                },
                                { data: message.data }
                            ]
                        }
                    ]
                },
                message,
                options,
                async err => {
                    if (err) {
                        logger.error(
                            `#API Error on saving a new message on the database of roomId=${roomId}. ${err}`,
                            req.body
                        );

                        // 409 === Conflict
                        res.status(409).send(false);
                        return;
                    }

                    res.send(true);
                }
            );
        } catch (err) {
            logger.error(
                `#API Error on saving a new message on the database of roomId=${roomId}. ${err}. Message=${JSON.stringify(
                    req.body
                )}`
            );

            // Bad Request
            res.status(400).send(false);
        }
    });

    /**
     * Fetch a bunch of messages.
     *
     * @callback @param {string} req.params.roomId
     * @callback @param {string} req.query.skip - Eg: 0 == newest message, 10 == older message.
     * @return {Array} Messages.
     */
    app.get('/api/public/rooms/:roomId/messages', async (req, res) => {
        const { roomId } = req.params;
        let { skip } = req.query;
        // Convert string to number.
        skip = parseInt(skip);

        try {
            const messages = await Message.aggregate([
                {
                    $match: {
                        room: ObjectId(roomId)
                    }
                },
                // The get the newest messages.
                { $sort: { timetoken: -1 } },
                { $skip: skip },
                // This limit has to be the same as on the front-end Fetch History.
                // & on Room API: get /api/rooms/:roomId
                { $limit: 30 }
            ]);

            res.send(messages);
        } catch (err) {
            logger.error(
                `#API Error on fetching messages from roomId=${roomId} since ${skip} newest message. ${err}`
            );

            // Not found
            res.status(404).send(null);
        }
    });
};
