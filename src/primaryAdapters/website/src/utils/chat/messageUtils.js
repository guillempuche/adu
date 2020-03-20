/**
 * Message utils.
 */
import _ from 'lodash';
import moment from 'moment';
import i18n from 'i18next';

import { isErrorOnSendingMessage } from './pubnub';

export {
    sendMessage,
    sendGoToBlocks,
    isMessageValid,
    createMessage,
    createAttachmentTemplate,
    getDataFromUUID,
    addOlderMessages,
    addNewMessage,
    getMessagesSinceTimetoken,
    getFileExtension,
    getTextFromLastMessage,
    fromNow,
    isDuplicatedMessage
};

// =============================================
//          SEND/TRANSFORM/CHECK... MESSAGES
// =============================================
/**
 * Send different type of message from bot and client to the channels.
 * The message can be a text message, quick replies...
 * @async
 * @param {Object} message
 * @param {Object} pubnub
 * @param {string|Array<string>} channels A group of channels or a channel where we will publish the message.
 * @return {{isError: Promise<boolean>, messageSent: Promise<Object>}}. Promise object. If message has sent successfully, there isn't an error, else `isError`=`true`. We also return the message.
 */
const sendMessage = async (message, pubnub, channels) => {
    // Validate the message.
    isMessageValid(message);

    async function publish(channel) {
        return new Promise(resolve => {
            pubnub.publish(
                {
                    message,
                    channel,
                    // Only save the message on faculty channel which users
                    // use it to know the incoming messages.
                    storeInHistory: channel.startsWith('faculty') ? true : false
                },
                status => {
                    const isError = isErrorOnSendingMessage(status);
                    resolve({ isError, messageSent: message });
                }
            );
        });
    }

    if (Array.isArray(channels)) {
        const promises = channels.map(async channel => {
            return await publish(channel);
        });

        // Array of resolved Promises.
        const results = await Promise.all(promises);

        let isError = false;
        results.forEach(item => {
            if (item.isError) isError = true;
        });

        return { isError, message };
    }

    return await publish(channels);
};

/**
 * Print the the quick reply clicked as a simple message, then
 * redirect the user to the block message that he wants.
 * @async
 * @param {Array<string>} goToBlocks - Sender has clicked a Quick Reply and wants to go to a block of information (a specific FAQ).
 * @param {Object} pubnub PubNub instance.
 * @param {string|Array<string>} channels A group of channels or a channel where we will publish the message.
 * @return {{isError: Promise<boolean>, messageSent: Promise<Object>}}. Promise object. If message has sent successfully, there isn't an error, else `isError`=`true`. We also return the message.
 */
const sendGoToBlocks = async (goToBlocks, pubnub, channels) => {
    async function publish(channel) {
        return new Promise(resolve => {
            pubnub.publish(
                {
                    message: { goToBlocks },
                    channel
                },
                status => {
                    const isError = isErrorOnSendingMessage(status);

                    resolve({ isError });
                }
            );
        });
    }

    if (Array.isArray(channels)) {
        const promises = channels.map(async channel => {
            return await publish(channel);
        });

        // Array of resolved Promises.
        const results = await Promise.all(promises);

        let isError = false;
        results.forEach(item => {
            if (item.isError) isError = true;
        });

        return { isError };
    }

    return await publish(channels);
};

/**
 * Validate the message data.
 * @param {Object} message
 * @param {string} message.roomId.
 * @param {string} message.sender PubNub's UUID.
 * @param {number} message.timetoken Time in milliseconds (13-digits).
 * @param {Object} message.data Message content.
 * @return {{isValid: boolean, validationMessage: string}} If the message is valid `isValid`=`true`; `validationMessage` explains the error.
 */
const isMessageValid = message => {
    const { roomId, sender, timetoken, data } = message;

    // Default values.
    let isValid = false,
        validationMessage = '';

    // If there's a typing error or something else, catch the error.
    try {
        // Validate the top-level of the message.
        if (
            _.keys(message).length === 4 &&
            typeof roomId === 'string' &&
            typeof sender === 'string' &&
            (typeof timetoken === 'number' &&
                timetoken.toString().length === 13) &&
            _.isEmpty(data) === false
        ) {
            const senderType = getDataFromUUID(sender).type;

            // Validate the sender object.
            if (
                senderType === 'client' ||
                senderType === 'user' ||
                senderType === 'bot'
            )
                isValid = true;
            else
                throw Error(
                    `String 'sender' contains invalid characters: ${senderType}`
                );

            // Validate data object.
            if (
                typeof data.lang === 'string' &&
                _.isEmpty(data.type) === false
            ) {
                // It can exist 'text', 'quickReplies' or 'attachment', but not both (XOR operator). If we don't use undefined, XOR of different types: Number(1) ^ Number(2) will be true. We want only one property, not the two.
                if (
                    _.keys(data.type).length === 1 &&
                    (data.type.text !== undefined) ^
                        Array.isArray(data.type.quickReplies) ^
                        (data.type.attachment !== undefined)
                ) {
                    // Validations for 'data' (it will only be validated the property that exists):
                    switch (getMessageType(data.type)) {
                        // Validate the property 'text' of data.
                        case 'text':
                            if (
                                data.type.text &&
                                typeof data.type.text === 'string'
                            )
                                isValid = true;
                            else {
                                isValid = false;
                                validationMessage = `'data.type.text' has to be a string`;
                            }
                            break;
                        // Validate the property 'quickReplies' of data.
                        case 'quickReplies':
                            if (data.type.quickReplies) {
                                const { quickReplies } = data.type;

                                // Validate each Quick Reply: Text & GoToBlock of everyone. TIP: We use 'every()' because when its callback return falsy, it stops the iteration.
                                quickReplies.every((el, index) => {
                                    if (
                                        typeof el.text === 'string' &&
                                        Array.isArray(el.goToBlocks)
                                    ) {
                                        // If goToBlocks are good, we pass the test.
                                        return el.goToBlocks.every((e, i) => {
                                            if (typeof e === 'string') {
                                                isValid = true;
                                                return true;
                                            } else {
                                                isValid = false;
                                                validationMessage = `quickReplies[${index}].goToBlocks[${i}]=${e} isn't a string`;
                                                return false;
                                            }
                                        });
                                    } else {
                                        isValid = false;
                                        validationMessage = `quickReplies[${index}]: 'text' isn't a string or 'goToBlocks' isn't an array`;
                                        return false;
                                    }
                                });
                            } else {
                                isValid = false;
                                validationMessage = `'quickReplies' isn't valid`;
                            }
                            break;
                        // Validate the property 'attachment' of data.
                        case 'attachment':
                            if (
                                _.keys(data.type.attachment).length === 2 &&
                                data.type.attachment.type &&
                                data.type.attachment.payload
                            ) {
                                const { attachment } = data.type;
                                const { type, payload } = attachment;

                                // Validate the 'type'. If it pass, we validate the 'payload', else we return invalid.
                                if (
                                    type === 'image' ||
                                    type === 'file' ||
                                    type === 'template'
                                ) {
                                    if (type === 'image' || type === 'file') {
                                        const { fileName, url } = payload;

                                        // Validate the 'payload'.
                                        if (
                                            _.keys(payload).length === 2 &&
                                            typeof fileName === 'string' &&
                                            typeof url === 'string'
                                        )
                                            isValid = true;
                                        else {
                                            isValid = false;
                                            validationMessage = `'attachment.payload' isn't valid. It has to have: 'fileName' string & 'url' string`;
                                        }
                                    } else if (type === 'template') {
                                        const { templateType } = payload;

                                        if (templateType === 'email')
                                            isValid = true;
                                        else {
                                            isValid = false;
                                            validationMessage = `'attachment.payload' hasn't a valid 'templateType' (string 'email')`;
                                        }
                                    }
                                } else {
                                    isValid = false;
                                    validationMessage = `'attachment.type' has to be the string 'image', 'file' or 'template'`;
                                }
                            } else {
                                isValid = false;
                                validationMessage = `'attachment' isn't valid. It has to have: 'type' string & 'payload' object`;
                            }
                            break;
                        default:
                            break;
                    }
                } else {
                    isValid = false;
                    validationMessage = `It can only exist 'text', 'quickReplies' or 'attachment' and not more than one of them`;
                }
            } else {
                isValid = false;
                validationMessage = `'type' is empty or 'lang' isn't a string`;
            }
        } else {
            isValid = false;
            validationMessage = `Message has to have 4 properties: string 'roomId', string 'sender', number 'timetoken' of 13-digits & object 'data'`;
        }
    } catch (err) {
        isValid = false;
        validationMessage = err;
    }

    if (isValid) validationMessage = 'Correct';
    else
        validationMessage = `Error on validating the message format. ${validationMessage}. Message=${JSON.stringify(
            message
        )}`;

    // Crash the app if message format isn't valid.
    if (!isValid) {
        console.error(validationMessage);
        throw Error(validationMessage);
    }

    return {
        isValid,
        validationMessage
    };
};

/**
 * Get the message with same structure as Message Database.
 * @param {string} roomId
 * @param {Object} content Message's content.
 * @param {Object} pubnub PubNub instance
 * @return {{sender: { type: string, _id: ?string}, timetoken: string, data: Object}} Message object.
 * @return `sender` - Information about who has sent the message.
 * @return `sender.type` - Can only be: `clients`, `users` or `bot`.
 * @return `sender._id` - Sender's id, eg: "5c9f94ff134c8107b89cd242".
 * @return `timetoken` - Message's sent time (type of `Number`).
 * @return `data` - Message's content.
 */
const createMessage = (roomId, content, pubnub) => {
    const message = {
        roomId,
        sender: pubnub.getUUID(),
        timetoken: moment().valueOf(), // Get the current time in milliseconds (as a type of Number).
        data: {
            // Get the language used by the app.
            lang: i18n.languages[i18n.languages.length - 1],
            type: content
        }
    };

    // Verify the message format.
    const { isValid, validationMessage } = isMessageValid(message);

    if (isValid) return message;
    else throw Error('Error on creating the message. ' + validationMessage);
};

/**
 * Get the at with same structure as Message Database.
 *
 * @param {string} templateType Can be: `email`.
 * @return {{type: string="template", payload: {templateType: string, text: string}}}
 */
const createAttachmentTemplate = templateType => {
    let attachment = {};

    if (templateType === 'email') {
        attachment = {
            type: 'template',
            payload: {
                templateType
            }
        };

        return attachment;
    } else {
        throw Error(`Invalid 'templateType'`);
    }
};

/**
 * Get `type` & `id` from the UUID.
 *
 * More on `createUUID()` on `chatUtils.js`.
 * @param {string} uuid Eg: `clients#5c9f94ff134c8107b89cd242`
 * === `clients#5c9f94ff134c8107b89cd242`. The structure is the
 * same of the Message Database or Room's member Database.
 * @return {{type: string, id: string}}
 */
const getDataFromUUID = uuid => {
    const hashPosition = uuid.indexOf('#');
    let type, id;

    if (hashPosition !== -1) {
        type = uuid.slice(0, hashPosition);
        id = uuid.slice(hashPosition + 1);
    } else {
        type = 'bot';
        id = null;
    }

    return { type, id };
};

/**
 * Join the fetched messages (they're older) with the original messages.
 *
 * @param {Array} messages Original messages. Order from the newest (eg: newest=`messages[0]`, older=`messages[10]`).
 * @param {Array} olderMessages A bulk of messages that have to save with the originals.
 * @return {Array} The joint of all messages.
 */
const addOlderMessages = (messages, olderMessages) => {
    _.forEach(olderMessages, message => {
        messages.push(message);
    });

    return messages;
};

/**
 * Add a new message as the newest message on the original messages.
 * This function is the same that on the server side when we save
 * the new message to the database.
 * @param {Array} history - Has to be ordered from the newest
 * (`messages[0]`) to the oldest (eg: `messages[10]`).
 * @param {Object} newMessage - The new message.
 * @return {Array} The updated history.
 */
const addNewMessage = (history, newMessage) => {
    if (_.isEmpty(history) === true) {
        // Add the new message.
        history.push(newMessage);
    } else {
        // Delete the quick replies (it's the newest message from the history).
        if (history[0].data.type.hasOwnProperty('quickReplies')) {
            _.pullAt(history, 0);
        }

        // Add new message on the first position.
        history.unshift(newMessage);
    }

    return history;
};

/**
 * Get all message: since a timetoken & from a specific sender.
 * @param {Array} history All messages.
 * @param {number} timetoken 13-digits === milliseconds.
 * @param {string} by Can be: `bot`, `clients` or `users`.
 * @param {string} [id] If `by` is `client` or `user`, this is required. Eg: `5c9f94ff134c8107b89cd242`.
 * @return {Array} Messages ordered from newest (the first element) to oldest (the last element).
 */
function getMessagesSinceTimetoken(history, timetoken, by, id) {
    return history.filter(message => {
        if (message.timetoken >= timetoken) {
            const { type, _id } = message.sender;

            if (by === 'bot' && type === by) {
                return true;
            } else if (
                (by === 'clients' || by === 'users') &&
                type === by &&
                _id === id
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    });
}

/**
 * We filter what type of content of the message has.
 * @param {Object} type Message content type.
 * @return {string} The type of message: `text`, `quickReplies` or `attachment`.
 */
const getMessageType = type => {
    const text = 'text',
        quickReplies = 'quickReplies',
        attachment = 'attachment';

    if (type.hasOwnProperty(text)) return text;
    else if (type.hasOwnProperty(quickReplies)) return quickReplies;
    else if (type.hasOwnProperty(attachment)) return attachment;
    else throw Error('Message type is invalid');
};

/**
 * Extract from URL the file/image extension (eg: `pdf`, `jpg`, `docx`...)
 *
 * @param {string} url Eg: http://res.cloudinary.com/.../test.pdf
 * @return {?string} The file name extension.
 *
 */
function getFileExtension(url) {
    const index = url.lastIndexOf('.');

    // If length of index is 0 or negative, an empty string is returned.
    if (index <= 0) return null;
    return url.substr(index + 1);
}

/**
 * Get text from the most recent message, except from the Quick Replies.
 * Steps:
 *
 *      1) Get the last message (omit the Quick Replies).
 *
 *      2) Get the sender (if sender === me, the sender will be an empty value).
 *
 *      3) Get the text.
 *
 * @param {Array} messages All messages.
 * @param {Object} me The actual user data.
 * @return {string} Format: Sender (not if the sender === me): Content.
 * Eg: `Visitante: Hola!`, `Bot: Imagen` or `Te paso la información.`
 */
function getTextFromLastMessage(messages, me) {
    // Default values.
    let senderFormatted = '',
        content;

    // Step 1
    // Get translations.
    const chatList = i18n.getResourceBundle(
        i18n.languages[i18n.languages.length - 1],
        'chatList'
    );

    // We save the last message, but if the it's a Quick Replies,
    // we omit it and go to next.
    let index = 0;
    if (messages[0].data.type.quickReplies) {
        index = 1;
    }

    // Message we will use to extract the sender & content.
    const { sender, data } = messages[index];

    // Step 2
    // Create the sender.
    switch (sender.type) {
        case 'users':
            // If sender is the same as the actual user (me),
            // sender will be an empty string.
            if (sender._id !== me._id) {
                senderFormatted =
                    chatList.item['message-sender-faculty'] + ': ';
            }
            break;
        case 'clients':
            senderFormatted = chatList.item['message-sender-client'] + ': ';
            break;
        case 'bot':
            senderFormatted = 'Au: ';
            break;
        default:
            break;
    }

    // Step 3
    const { text, attachment } = data.type;

    if (text) {
        content = text;
    } else if (attachment) {
        // According to the attachment, the text is different.
        switch (attachment.type) {
            case 'image':
                content = chatList.item['message-image'];
                break;
            case 'file':
                content = chatList.item['message-file'];
                break;
            case 'template':
                if (attachment.payload.templateType === 'email')
                    content = chatList.item['message-template-email'];
                break;
            default:
                break;
        }
    }

    return senderFormatted + content;
}

// ==============================================
//          TIME OF THE MESSAGE
// ==============================================
/**
 * Create from 13-digit epoch time in a `moment`.
 *
 * This function is used only in this module.
 *
 * @param {number} timetoken Epoch time of 13-digit = nanoseconds. Eg: "1554810350990"
 * @return Timetoken converted to a moment.
 */
function getTimetokenToMoment(timetoken) {
    // Convert timetoken to moment.
    return moment(timetoken);
}

/**
 * Get the timestamp between the given time and now in multiple formats.
 * @type {Object}
 * @type {prettier: function} In a pretty way.
 * @type {days: function} In days.
 */
const fromNow = {
    /**
     * Get a pretty formatted time. It changes according to the language that the AU uses.
     *
     * @param {number} timetoken In milliseconds (13-digit).
     * @return {string} Time.
     */
    prettierExtend: timetoken => {
        const m = getTimetokenToMoment(timetoken);
        // Save actual time.
        const now = moment();
        // Check if the timetoken is the same day as today.
        const isToday = !m.isBefore(now, 'day');
        // Number of hours from now.
        const minutesFromNownow = now.diff(m, 'minutes');
        // Number of days from now.
        const daysFromNow = now.diff(m, 'days');

        // If less than or equal than 44 minutes, we show: 44 seconds ago, 2 hours ago...
        // If more than 44 minutes & is today, we show: 9:41, 1:42...
        // If yesterday & less than one week, we show: Monday, Thursday...
        // Else, 4/2/2019.
        if (minutesFromNownow <= 44) {
            // https://momentjs.com/docs/#/displaying/fromnow/
            return _.upperFirst(m.fromNow(true));
        } else if (minutesFromNownow > 44 && isToday) {
            // https://momentjs.com/docs/#/displaying/format/
            return m.format('LT');
        } else if (!isToday && daysFromNow <= 6) {
            // https://momentjs.com/docs/#/displaying/format/
            return _.upperFirst(m.format('dddd - LT'));
        } else {
            // https://momentjs.com/docs/#/displaying/format/
            // Eg: "9/4/1986 8:30 PM" on the locale language.
            return m.format('l - LT');
        }
    },
    /**
     * Get a pretty formatted time. It changes according to the language
     * that the AU uses.
     *
     * TIP: inspiration from Whatsapp.
     *
     * @param {number} timetoken In milliseconds (13-digit).
     * @return {string}
     */
    prettierShort: timetoken => {
        const m = getTimetokenToMoment(timetoken);
        // Save actual time.
        const now = moment();
        // Check if the timetoken is the same day as today.
        const isToday = !m.isBefore(now, 'day');
        // Number of days from now.
        const daysFromNow = now.diff(m, 'days');

        // If less than or equal than 44 minutes, we show: 44 seconds ago, 2 hours ago...
        // If it's today, we show: 9:41, 1:42...
        // If yesterday & less than one week, we show: Monday, Thursday...
        // Else, 4/2/2019.
        if (isToday) {
            // https://momentjs.com/docs/#/displaying/format/
            return m.format('LT');
        } else if (!isToday && daysFromNow <= 6) {
            // https://momentjs.com/docs/#/displaying/format/
            return _.upperFirst(m.format('dddd'));
        } else {
            // https://momentjs.com/docs/#/displaying/format/
            return m.format('l');
        }
    },
    /**
     * Get the differemce in days.
     *
     * @param {number} timetoken 13-digit string = milliseconds
     * @return {number} Days from now.
     */
    days: timetoken => {
        // Create a moment from timetoken. It's local mode, not UTC mode.
        const m = getTimetokenToMoment(timetoken);
        // Save actual time.
        const now = moment();
        // Number of days from now.
        return now.diff(m, 'days');
    }
};

/**
 * Check if the message we want to save has a duplication on the history.
 * This can be because the user/client has multiple browser tabs or devices
 * opened with the chat.
 * @param {Array} lastMessages Collection of the newest messages already saved.
 * @param {Object} newMessage New message to check.
 * @return {boolean} If it's duplicated, `true`. Else, `false`.
 */
const isDuplicatedMessage = (lastMessages, newMessage) => {
    const senderNewMessage = JSON.stringify(newMessage.sender);
    const contentNewMessage = JSON.stringify(newMessage.data.type);

    return lastMessages.some(lastMessage => {
        // Check if it isn't any message on history, else return `false`.
        if (lastMessage) {
            const senderLastMessage = JSON.stringify(lastMessage.sender);
            const contentLastMessage = JSON.stringify(lastMessage.data.type);

            // If the sender & message content are the same, and also the time
            // between messages is practically 0 seconds (requests, processes,
            // networks... can take some time on differents sessions & devices).
            // Timetokens are in milliseconds.
            if (
                senderLastMessage === senderNewMessage &&
                contentLastMessage === contentNewMessage &&
                (lastMessage.timetoken > newMessage.timetoken - 500 &&
                    lastMessage.timetoken < newMessage.timetoken + 500)
            )
                return true;
        }

        return false;
    });
};
