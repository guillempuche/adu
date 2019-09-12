const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * IMPORTANT: All text for messages has to be be normalized to
 * Unicode Normalization Form Canonical Composition (NFC).
 */
const messageSchema = new Schema({
    room: {
        type: Schema.Types.ObjectId,
        ref: 'rooms',
        required: [true, `Room's id`]
    },
    sender: {
        type: String,
        required: true
    },
    // Millisecond-precision Unix Time (UTC) == 13-digit string, eg: "1554810350920".
    timetoken: {
        type: Number,
        required: [
            true,
            'It has to be a number with precision of milliseconds (13-digits) & in UTC.'
        ]
    },
    data: {
        lang: { type: String, required: true },
        // Inspiration for the type's structure from https://docs.chatfuel.com/api/json-api/json-api
        type: {
            text: String,
            quickReplies: [
                {
                    text: String,
                    // Blocks' ids.
                    goToBlocks: [String]
                    // Objects which are attached to client user.
                    // set_attributes: Schema.Types.Mixed
                }
            ],
            attachment: {
                type: {
                    type: String,
                    enum: ['image', 'file', 'template']
                },
                payload: {
                    // For types `image` & `file`.
                    fileName: String, // Name for the image/file.
                    url: String, // URL of image/file.
                    // Templates type:
                    templateType: {
                        type: String,
                        enum: ['email']
                    }
                }
            }
        }
    }
});

module.exports = mongoose.model('messages', messageSchema);
