/**
 * Initilization and all logic for the bot.
 */
'use strict';

import _ from 'lodash';
import i18n from 'i18next';

import store from '../../reducers/store';
import database from './messagesDatabase';
import pubnubInit, {
    isErrorOnSendingMessage,
    subscribeToChannels,
    sendEvent
} from './pubnub';
import {
    createMessage,
    createAttachmentTemplate,
    getMessagesSinceTimetoken,
    fromNow
} from './messageUtils';
import { saveAndSendMessage } from '../../actions';

let pubnub = {},
    channelsToPublish = [];

/**
 * Initilize the bot.
 */
export default () => {
    // ========================================
    //          INITILIZE A BOT
    // ========================================
    try {
        // Bot's instance.
        // IMPORTANT: It can only be `bot` because this effects the
        // working on Message Routes API.
        pubnub = pubnubInit('bot');

        /**
         * PubNub's events handler.
         *
         * IMPORTANT: Listeners have to be added before calling the method.
         */
        pubnub.addListener({
            /**
             * Message handler.
             * More on: https://www.pubnub.com/docs/web-javascript/api-reference-publish-and-subscribe#subscribe-message-response
             * @param {Object} m Message data.
             * @param {string} m.channel The channel name for which the message belongs.
             * @param {string} m.subscription The channel group or wildcard subscription match (if exists).
             * @param {string} m.timetoken Publish timetoken.
             * @param {Object} m.message The payload.
             * @param {Object} m.publisher The publisher.
             */
            message: async m => {
                try {
                    const { message, publisher } = m;
                    const { client, chat } = getCurrentState();
                    const { history, room } = chat.selectedRoom;
                    const { stoppedFAQs } = room.attributes;
                    // ==============================================
                    //          BOT HANDLES THE CONVERSATION (NOT
                    //          FACULTY"S WORKERS)
                    // ==============================================
                    // The room is on automatic (faqs doesn't stopped). We only
                    // read the message from other publishers, not the from the bot.
                    if (
                        stoppedFAQs === null &&
                        publisher !== pubnub.getUUID() &&
                        message.goToBlocks
                    ) {
                        message.goToBlocks.forEach(async blockId => {
                            // The client wants to talk to a person of
                            // the faculty, and the bot won't show more FAQs.
                            if (blockId === 'person') {
                                await stopFaqs();
                            } else {
                                sendMessageFromFAQs(blockId);
                            }
                        });
                    }

                    // ==============================================
                    //          BOT WATCH THE CONVERSATION, BUT
                    //          FACULTY"S WORKERS HANDLE IT.
                    // ==============================================
                    // The bot isn't showing more FAQs. It means that the
                    // client is talking to the faculty. But the bot has
                    // to be alert to sent some special message.
                    if (stoppedFAQs) {
                        const messagesFromClient = getMessagesSinceTimetoken(
                            history,
                            stoppedFAQs,
                            'clients',
                            client._id
                        );
                        const messagesFromBot = getMessagesSinceTimetoken(
                            history,
                            stoppedFAQs,
                            'bot'
                        );

                        // The bot will to show the Email Template to the
                        // client only when:
                        // - room is on mode `Stopped FAQs`.
                        // - client has questioned to the faculty with one
                        // message since the time when FAQs had been stopped.
                        if (
                            messagesFromClient.length === 1 &&
                            messagesFromBot.length === 1
                        ) {
                            await sendTemplate('email');
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            },
            /**
             * Status response.
             *
             * More on: https://www.pubnub.com/docs/web-javascript/api-reference-publish-and-subscribe#listeners
             *
             * @param {Object} s Status response.
             * @param {Array} s.category Status events.
             * @param {Array} s.affectedChannelGroups The channels groups affected in the operation.
             * @param {Array} s.affectedChannels The channels affected in the operation.
             * @param {Array} s.operation Name of the operation.
             */
            status: s => {
                // If an error sending the message, we print it.
                isErrorOnSendingMessage(s);
            }
        });

        const { chat } = store.getState();

        // Save all channels where bot will publish all the messages.
        channelsToPublish = chat.globalChannels.concat(
            chat.selectedRoom.roomChannels
        );

        // Subscribe the bot only to the room's channels.
        subscribeToChannels(pubnub, chat.selectedRoom.roomChannels);

        startConversation();
    } catch (err) {
        throw Error(err);
    }
};

/**
 * Get the PubNub instance.
 * @return {Object} PubNub instance.
 */
function getPubnub() {
    return pubnub;
}

/**
 * Get channels where it has to publish the messages.
 * @return {Array} Channels
 */
function getChannels() {
    return channelsToPublish;
}

/**
 * Get current Redux State.
 * @return {Object} Redux Store
 */
function getCurrentState() {
    return store.getState();
}

/**
 * Save message to Message Database and send it via PubNub.
 * @param {Object} message
 */
function sendMessage(message) {
    store.dispatch(saveAndSendMessage(message));
}

/**
 * Get text translated from `i18next`.
 * @return {Object} Chat Client transalation
 */
function getTextBundle() {
    // 'getResourceBundle' only accepts 'es', not 'es-ES'. We
    // need to extract the primary language from extended
    // language subtags.
    return i18n.getResourceBundle(
        i18n.languages[i18n.languages.length - 1],
        'chatClient'
    );
}

/**
 * Send a PubNub message after client clicks a Quick Reply.
 * @param {string} blockId - Look on the FAQs' database a FAQ with this `id`.
 */
function sendMessageFromFAQs(blockId) {
    const pubnub = getPubnub();

    // Search for the message on the database that is equal to the id.
    const faqs = _.find(database, { id: blockId });

    if (!faqs) throw Error(`BlockId=${blockId} not found on FAQ Database`);

    faqs.data.forEach((messageContent, index) => {
        // Create a recursive delay because of the ordered of sent FAQs could be altered.
        setTimeout(async () => {
            const message = createMessage(
                getCurrentState().chat.selectedRoom.room._id,
                messageContent.type,
                pubnub
            );

            await sendMessage(message);
        }, 400 * index);
    });
}

/**
 * Alert to client's PubNub to set the room on state 'FAQs are stopped'. Steps:
 *      1. Alert the client's PubNub.
 *      2. Bot sends a text message informing that now client can write the question.
 */
async function stopFaqs() {
    const pubnub = getPubnub();
    const channels = getChannels();

    // Step 1
    let { isError, messageSent } = await sendEvent(
        'stoppedFAQs',
        pubnub,
        channels
    );

    if (isError) throw Error(messageSent);

    // Step 2. Create a delay to prevent error due to timetokens
    // (between event message & text message) when bot is watching
    // the conversation === Stopped FAQs.
    setTimeout(async () => {
        // Get a bundle of translated text.
        const chatClient = getTextBundle();

        // Get text translated.
        const text = chatClient.content['message-stopped-faqs'];
        const message = createMessage(
            getCurrentState().chat.selectedRoom.room._id,
            { text },
            pubnub
        );

        await sendMessage(message);
    }, 50);
}

/**
 * Send a PubNub message with attachment type `template`.
 * @param {string} templateType - Can be: `email`.
 */
async function sendTemplate(templateType) {
    let attachment = {};
    // PubNub instance to send the message.
    const pubnub = getPubnub();

    if (templateType === 'email') {
        attachment = createAttachmentTemplate(templateType);
    }

    const message = createMessage(
        getCurrentState().chat.selectedRoom.room._id,
        { attachment },
        pubnub
    );

    await sendMessage(message);
}

/**
 * The bot sends FAQs only if the room hasn't state `Stopped FAQs`.
 *
 * How the bot has to start the conversation depends on when the last interaction was:
 * 1. The first time === without history.
 * 2. Before 1 day. Don't do anything.
 * 3. More than 15 days.
 */
function startConversation() {
    const { room, history } = getCurrentState().chat.selectedRoom;

    if (room.attributes.stoppedFAQs === null) {
        // Delay 4 seconds for a better UX, because this will be shown when the chat opens.
        setTimeout(() => {
            if (_.isEmpty(history)) {
                sendMessageFromFAQs('welcome');
            } else {
                const daysFromNow = fromNow.days(history[0].timetoken);

                switch (true) {
                    case daysFromNow > 30:
                        sendMessageFromFAQs('hi');
                        break;
                    default:
                        break;
                }
            }
        }, 2000);
    }
}
