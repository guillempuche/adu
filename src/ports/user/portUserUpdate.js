const makeUser = require('../../domain/user');

module.exports = function makeUpdateUser({ usersDb, userIsEqual }) {
    return async function updateUser({ _id, ...changes } = {}) {
        if (!_id) throw new Error(`User id must be supplied.`);

        const existingUser = await usersDb.findById(_id);

        if (!existingUser) throw new RangeError('User not found.');

        const userWithChanges = makeUser({
            ...existingUser,
            ...changes
        }).getUser();

        if (userIsEqual(existingUser, userWithChanges)) return existingUser;

        const userUpdated = await usersDb.updateOne(userWithChanges);

        return { ...existingUser, ...userUpdated };
    };
};
