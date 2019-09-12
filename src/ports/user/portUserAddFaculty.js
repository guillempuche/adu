const makeUser = require('../../domain/user');

module.exports = function makeAddUserFaculty({ usersDb, cloneUser }) {
    return async function addUserFaculty({ _id, _faculty } = {}) {
        if (!_id) {
            throw new Error(`You must supply a user's id.`);
        }

        const existingUser = await usersDb.findById({ _id });

        if (!existingUser) {
            throw new RangeError('User not found.');
        }

        if (existingUser._faculties.find(id => id === _faculty)) {
            return existingUser;
        }

        let userCloned = cloneUser(existingUser);
        userCloned._faculties.push(_faculty);

        const userWithChanges = makeUser({ ...userCloned });

        const userUpdated = await usersDb.updateOne({ ...userWithChanges });
        return { ...existingUser, ...userUpdated };
    };
};
