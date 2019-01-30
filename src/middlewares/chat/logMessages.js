"use strict";

const mongoose = require("mongoose");

const Client = mongoose.model("clients");

async function saveToDatabase(clientId, message) {
    const client = await Client.findOneAndUpdate(
        // Conditions
        { clientId },
        // Update
        { $push: { messages: message } },
        // Mongoose options
        {
            new: true, // return the modified document rather than the original,
            upsert: true,
            runValidators: true
        }
    );

    return client;
}

module.exports.logMessage = async session => {
    var message,
        now = new Date();

    var client;

    // Get UTC timestamp in milliseconds.
    session.timestampUTC = Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
    );

    if (session.messageFrom === "bot") {
        // =============================================
        //      BOT SENDS A MESSAGE
        // =============================================
        const {
            messageFrom,
            text,
            type,
            textLocale,
            timestampUTC,
            agent,
            address
        } = session;

        // Format the message
        message = {
            messageFrom,
            text,
            type,
            locale: textLocale,
            timestampUTC: timestampUTC.toString(),
            address: {
                channel: address.channelId,
                addressId: address.id,
                conversationId: address.conversation.id
            },
            agent
        };

        try {
            saveToDatabase(address.user.id, message);
        } catch (err) {
            console.error(err);
        }
    } else if (session.messageFrom === "user") {
        // =============================================
        //      BOT RECEIVES A MESSAGE
        // =============================================
        const {
            text,
            type,
            textLocale,
            agent,
            address,
            user
        } = session.message;

        // Format the message
        message = {
            messageFrom: session.messageFrom,
            text,
            type,
            locale: textLocale,
            timestampUTC: session.timestampUTC.toString(),
            address: {
                channel: address.channelId,
                addressId: address.id,
                conversationId: address.conversation.id
            },
            agent
        };

        try {
            saveToDatabase(user.id, message);
        } catch (err) {
            console.error(err);
        }
    }
};
