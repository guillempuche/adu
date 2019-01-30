"use strict";

/**
 * Delete the Google user's id to not expose data on the client side.
 *
 * @param {Object} user
 */
module.exports.deleteUserGoogleAccountId = user => {
    // Convert model docuemnt into a plain object to manipulate the object.
    user = user.toObject();

    delete user.auth;

    return user;
};
