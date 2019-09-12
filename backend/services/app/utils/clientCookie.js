/**
 * Util logic for the cookies.
 */
'use strict';

const _ = require('lodash');

/**
 * Find the client's cookie from within the array of the browser user's cookies.
 *
 * @param {Object} cookies
 * @param {Array} cookies.browserUser[]
 * @param {string} cookie.browserUser[].clientId
 * @param {string} cookie.browserUser[].facultyId
 * @param {string} keyValue - `client` or `faculty`.
 * @param {Object} id - `{ facultyId: "23234" }` or `{ clientId: "12343" }` to find on cookies.
 * @return {?Object} `{clientId: ..., facultyId:...}` or `null` if it's found.
 */
const getClientCookie = (cookies, keyValue, id) => {
    let cookie = cookies['browserUser'];

    if (cookie) {
        let foundCookie = {};

        switch (keyValue) {
            case 'client':
                foundCookie = _.find(cookie, { clientId: id });
                break;
            case 'faculty':
                foundCookie = _.find(cookie, { facultyId: id });
                break;
            default:
                return null;
        }

        if (!foundCookie) return null;

        return foundCookie;
    }

    return null;
};

module.exports = {
    getClientCookie
};
