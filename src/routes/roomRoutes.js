/**
 * API for rooms.
 *
 * Methods:
 * - `get /api/rooms` Get the 10 most recent rooms.
 * - `get /api/rooms/:roomId` Get a room with: last messages or/and details of all room's members.
 * - `post /api/public/rooms` Get or create the client's room.
 * - `post /api/public/rooms/:roomId/attributes` Set a Room's attribute.
 * It can be a new attribute.
 * - `post /api/public/rooms/join` Set the time when a specific member of a room joined the room.
 * - `post /api/public/rooms/leave` Set the time when a specific member of a room leaved the room.
 */
'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const $ = require('mongo-dot-notation');
const { ObjectId } = require('mongoose').Types;

const logger = require('../utils/logger').logger(__filename);
const requireLogin = require('../middlewares/requireLogin');
const { getClientCookie } = require('../utils/clientCookie');
const { getDataFromUUID } = require('../utils/chatUtils');
const { deleteAuth0UserId } = require('../utils/cleanData');

const Room = mongoose.model('rooms');
const Message = mongoose.model('messages');
const User = mongoose.model('users');
const Client = mongoose.model('clients');

module.exports = app => {
    /**
     * Fetch the rooms with most recent messages.
     *
     * @callback @param {string} req.query.facultyId Faculty's id.
     * @callback @param {number} req.query.skip Number of most recent rooms to skip.
     * @return {[{_id: string, type: Object, members: Object, _faculties: Array, attributes: Object, messages: Array}]} Rooms.
     */
    app.get('/api/rooms', requireLogin, async (req, res) => {
        let { facultyId, skip } = req.query;
        // Convert string to number.
        skip = parseInt(skip);

        try {
            const rooms = await Message.aggregate([
                {
                    // Order the messages by the most recent.
                    $sort: {
                        timetoken: -1
                    }
                },
                {
                    // Fill out the room's data of every message
                    // (from the rooms collection).
                    $lookup: {
                        from: 'rooms',
                        localField: 'room',
                        foreignField: '_id',
                        as: 'room'
                    }
                },
                {
                    // Lookup creates an array in the "room" field. We
                    // have to deconstruct as an object instead of an array.
                    $unwind: {
                        path: '$room'
                    }
                },
                {
                    // Only find the messages which room is from a specific faculty.
                    $match: {
                        'room._faculties': {
                            $in: [ObjectId(facultyId)]
                        }
                    }
                },
                {
                    /**
                     * Group of messages by the same room.
                     * IMPORTANT: Rooms of the group aren't ordered, expect for the array of messages inside every room (from newest === first element, to oldest).
                     */
                    $group: {
                        _id: '$room._id',
                        _faculties: {
                            $first: '$room._faculties'
                        },
                        attributes: {
                            $first: '$room.attributes'
                        },
                        type: {
                            $first: '$room.type'
                        },
                        members: {
                            $first: '$room.members'
                        },
                        history: {
                            $push: {
                                room: '$room',
                                timetoken: '$timetoken',
                                sender: '$sender',
                                data: '$data'
                            }
                        },
                        // Helper field to know the most recent message
                        // (highest timetoken) of the room
                        lastTimetoken: {
                            $max: '$timetoken'
                        }
                    }
                },
                {
                    // Sort the rooms by the ones which have the most recent messages.
                    $sort: {
                        lastTimetoken: -1
                    }
                },
                {
                    // Delete the helper field.
                    $project: {
                        lastTimetoken: 0
                    }
                },
                // If we fetch various times for older rooms, we have to skip the most recent.
                { $skip: skip },
                // We only want 10 rooms.
                { $limit: 10 }
            ])
                // The server can use hard drive to store data during aggregation.
                .allowDiskUse(true);

            res.send(rooms);
        } catch (err) {
            logger.error(
                `#API Error on fetching all rooms of facultyId=${facultyId}. ${err}`
            );

            // Bad Request
            res.status(400).send(false);
        }
    });

    /**
     * Get a room according to the filters.
     */
    app.get('/api/rooms/:roomId', requireLogin, async (req, res) => {
        const { roomId } = req.params;
        // The array can be: 'lastMessages' or 'membersDetails'
        const withData = JSON.parse(req.query.withData);

        try {
            // Use `lean()` to get the room document as a plain JavaScript object (POJO), not Mongoose document. This will allow us to modify the object withoout problems.
            let room = await Room.findById(roomId).lean();

            if (withData.some(el => el === 'lastMessages')) {
                // Get the room along with its last messages.
                let history = await Message.aggregate([
                    {
                        $match: {
                            room: ObjectId(roomId)
                        }
                    },
                    {
                        $sort: {
                            timetoken: -1
                        }
                    },
                    // It has to be the same that on Message API: get /api/public/rooms/:roomId/messages
                    { $limit: 30 }
                ]);

                room.history = history;
            }

            if (withData.some(el => el === 'membersDetails')) {
                // Get the room with all its members with the details of each one.
                const promises = room.members.map(async member => {
                    let details = null;

                    const { type, id } = getDataFromUUID(member.uuid);

                    if (type === 'user') {
                        details = await User.findById(id);

                        // Clean authentification data before we expose it to the client server.
                        details = deleteAuth0UserId(details);
                    } else if (type === 'client') {
                        details = await Client.findById(id);
                    }

                    return { type, details };
                });

                room.members = await Promise.all(promises);
            }

            res.send(room);
        } catch (err) {
            logger.error(`#API Error on fetching roomId=${roomId}. ${err}`);

            // Bad Request
            res.status(400).send(false);
        }
    });

    /**
     * Find the room where the member is a part of room's members
     * .
     * If the room doesn't exist on the Room DB, we create it.
     *
     * IMPORTANT: For this version, the client only can be in one room, not multiples.
     * @callback @param {string} req.query.member
     * @return {Object} Room.
     */
    app.get('/api/public/rooms', (req, res) => {
        const { member } = req.query;
        // We extract the id, even if the whole string member can be saved to Room Database. Like this, server is independent from the front-end.
        const { type, id } = getDataFromUUID(member);

        try {
            if (type === 'client') {
                const { facultyId } = getClientCookie(
                    req.signedCookies,
                    'client',
                    id
                );

                Room.find(
                    {
                        members: {
                            $elemMatch: { uuid: `client#${id}` }
                        }
                    },
                    async (err, rooms) => {
                        const errorCookie = `FacultyId=${facultyId}`;

                        if (err) {
                            throw Error(`${errorCookie}. ${err}`);
                        }

                        // The client can only be in one room.
                        if (rooms.length > 1)
                            throw Error(
                                `There are +1 individual rooms for the client. It can only be one. ${errorCookie}.`
                            );

                        let room = {};

                        // If the room doesn't exist, we create a new one.
                        if (_.isEmpty(rooms))
                            room = await new Room({
                                members: [{ uuid: member }],
                                _faculties: [new ObjectId(facultyId)]
                            }).save();
                        // Save the fetched room.
                        else room = rooms[0];

                        res.send(room);
                    }
                );
            }
        } catch (err) {
            logger.error(
                `#API Error on fetching the room of the member=${member}. ${err}`
            );

            // 404 === Not Found
            res.status(404).send(false);
        }
    });

    /**
     * Set a Room's attribute. It can be a new attribute.
     *
     * @callback @param {Object} req.body.attribute Attribute to set the new value.
     * @callback @param {boolean} req.body.attribute.stoppedFaqs An attribute.
     * @callback @param {boolean} req.body.attribute.hasQuestionedAfterStop An attribute.
     * @return {Object} Room updated.
     */
    app.post('/api/public/rooms/:roomId/attributes', async (req, res) => {
        try {
            const { roomId } = req.params;
            const { attributes } = req.body;

            const operator = $.flatten({
                attributes
            });

            const room = await Room.findByIdAndUpdate(roomId, operator, {
                // To turn on update validators for update oprations.
                runValidators: true,
                // Return the modified document.
                new: true
            });

            res.send(room);
        } catch (err) {
            logger.error(
                `#API Error on setting the attribute=${JSON.stringify(
                    attribute
                )} in roomId=${roomId}. ${err}`
            );

            // Bad Request
            res.status(400).send(false);
        }
    });

    /**
     * Set the time when a specific member of a room joined the room.
     *
     * More info: https://support.pubnub.com/support/solutions/articles/14000043566
     * https://www.pubnub.com/docs/web-javascript/presence
     */
    app.post('/api/public/rooms/join', async (req, res) => {
        let { uuid, timestamp, channel } = req.body;
        const { type } = getDataFromUUID(uuid);

        // Channel is encoded (we don't know why).
        // Convert: room%235cd98f37903d692474e612b2 to
        // room#5cd98f37903d692474e612b2.
        channel = decodeURIComponent(channel);
        const channelType = getDataFromUUID(channel).type;
        const channelId = getDataFromUUID(channel).id;

        if ((type === 'client' || type === 'user') && channelType === 'room') {
            try {
                const room = await Room.findOneAndUpdate(
                    { _id: channelId, 'members.uuid': uuid },
                    {
                        $set: { 'members.$[member].joinedAt': timestamp }
                    },
                    {
                        arrayFilters: [{ 'member.uuid': { $eq: uuid } }],
                        runValidators: true,
                        new: true
                    }
                );

                // If room hasn't the member yet, we insert it.
                if (!room) {
                    await Room.findOneAndUpdate(
                        { _id: channelId },
                        {
                            $push: { members: { uuid, joinedAt: timestamp } }
                        },
                        {
                            runValidators: true
                        }
                    );
                }

                // Do something but do not delay the 200 response or PubNub will try calling
                // again after 5s of no response up to 3 times before it quits trying
                res.status(200).end();
            } catch (err) {
                logger.error(
                    `#API We can't update the 'joinedAt' of member=${uuid} from roomId=${channelId} at channel=${channel}. ${JSON.stringify(
                        err
                    )}`
                );
            }
        }
    });

    /**
     * Set the time when a specific member of a room leaves the room or a memeber has not been seen in over 5 minutes.
     *
     * More info: https://support.pubnub.com/support/solutions/articles/14000043566
     * https://www.pubnub.com/docs/web-javascript/presence
     */
    app.post('/api/public/rooms/leave', async (req, res) => {
        let { uuid, timestamp, channel } = req.body;
        const { type } = getDataFromUUID(uuid);

        // Channel is encoded (we don't know why).
        // Convert: room%235cd98f37903d692474e612b2 to
        // room#5cd98f37903d692474e612b2.
        channel = decodeURIComponent(channel);
        const channelType = getDataFromUUID(channel).type;
        const channelId = getDataFromUUID(channel).id;

        if ((type === 'client' || type === 'user') && channelType === 'room') {
            try {
                await Room.findOneAndUpdate(
                    { _id: channelId },
                    {
                        $set: { 'members.$[member].leavedAt': timestamp }
                    },
                    {
                        arrayFilters: [{ 'member.uuid': { $eq: uuid } }],
                        runValidators: true
                    }
                );
            } catch (err) {
                logger.error(
                    `#API We can't update the 'leavedAt' of member=${uuid} from roomId=${channelId} at channel=${channel}`
                );
            }
        }

        // Do something but do not delay the 200 response or PubNub will try calling
        // again after 5s of no response up to 3 times before it quits trying
        res.status(200).end();
    });
};
