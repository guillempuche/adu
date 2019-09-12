'use strict';

/**
 * User Domain
 * @param {Object} params Inject necessary dependencies
 * @return {function} Instance of User entity
 */
module.exports = function buildMakeUser({ Id, validator }) {
    return function makeUser({
        _id = Id.makeId(),
        name: { displayName, fullName },
        emails: { auth, account },
        profilePicture,
        roles = [],
        _faculties = []
    } = {}) {
        const user = {
            _id,
            name: { displayName, fullName },
            emails: { auth, account },
            profilePicture,
            roles,
            _faculties
        };

        validator(user);

        // It's only allowed to read the user properties.
        return Object.freeze({
            getUser: () => user,
            getId: () => user._id,
            getAuth: () => user.auth,
            getName: () => user.name,
            getEmails: () => user.emails,
            getProfilePicture: () => user.profilePicture,
            getRoles: () => user.roles,
            getFaculties: () => user._faculties
        });
    };
};
