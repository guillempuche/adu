'use strict';

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
 * Get member's data.
 * @param {string} uuid Eg: `clients#5c9f94ff134c8107b89cd242`.
 * @return {{type: string, id: string}} Type can be: `client`, `user`, `bot`, `faculty` or `room`.
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
 * Extract from URL the file/image extension (eg: `pdf`, `jpg`, `docx`...)
 *
 * @param {string} url Eg: http://res.cloudinary.com/.../test.pdf
 * @return {?string} The file name extension.
 *
 */
const getFileExtension = url => {
    const index = url.lastIndexOf('.');

    // If length of index is 0 or negative, an empty string is returned.
    if (index <= 0) return null;
    return url.substr(index + 1);
};

module.exports = {
    getMessageType,
    getDataFromUUID,
    getFileExtension
};
