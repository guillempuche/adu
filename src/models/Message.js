const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
    messageFrom: String,
    type: String,
    text: String,
    locale: String,
    timestampUTC: String,
    address: {
        channel: String,
        addressId: String,
        conversationId: String,
        dialogId: String
    },
    agent: String
});

module.exports = messageSchema;
