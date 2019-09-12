const makeUser = require('../../domain/user');

module.exports = function makeAddUser({ usersDb }) {
    return async function addUser(userData) {
        const userToAdd = makeUser(userData);
        const userExists = await usersDb.findById(userToAdd.getId());

        if (userExists) return userExists;

        return usersDb.insertOne(userToAdd.getUser());
    };
};
