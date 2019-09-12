const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new Schema({
    // Members (clients & users) who have sent at least one message on the room.
    members: [
        // Subdocument.
        new Schema(
            {
                leavedAt: { type: Number, default: null },
                // Object ids of users & clients.
                uuid: { type: String, required: true },
                joinedAt: { type: Number, default: null }
            },
            // Don't add '_id' to the subdocument.
            { _id: false }
        )
    ],
    // Faculties where this chat room is associated.
    _faculties: [{ type: Schema.Types.ObjectId, ref: 'faculties' }],
    /**
     * Metadata of the chat room.
     * @typedef {Object} attributes
     * @typedef {?number} attributes.stoppedFAQs If bot doesn't show more FAQs, it's the timetoken (13-digits === milliseconds) when it has been stopped, else `null`.
     * @typedef {string} attributes.state State of the conversation.
     */
    attributes: {
        stoppedFAQs: { type: Number, default: null },
        state: {
            type: String,
            enum: ['solved', 'unsolved', 'followup'],
            default: 'solved'
        }
    }
});

module.exports = mongoose.model('rooms', roomSchema);
