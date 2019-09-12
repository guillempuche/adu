'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * A client is a user who chats with the faculty's chat. He can only be associate
 * to one faculty.
 */
const clientSchema = new Schema(
    {
        name: String,
        _faculty: {
            type: Schema.Types.ObjectId,
            ref: 'faculties',
            required: true
        },
        /**
         * @typedef {Object} attributes Multiple information about client.
         * @typedef {string} attributes.email Email to send notifications
         */
        attributes: {
            email: String
        }
    },
    // Mongoose will store all objects even they are empty
    { minimize: false }
);

module.exports = mongoose.model('clients', clientSchema);
