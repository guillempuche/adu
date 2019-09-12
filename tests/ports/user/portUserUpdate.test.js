'use strict';

const makeUpdateUser = require('../../../src/ports/user/portUserUpdate');
const makeUsersDb = require('../../../src/secondaryAdapters/db/usersDb');
const { startDb, clearDb } = require('../../secondaryAdapters/db/localDb');
const makeFakeUser = require('../../utils/faker/user');
const _ = require('lodash');
// Library to transform objects to mongo update instructions using operators. https://www.npmjs.com/package/mongo-dot-notation
const $ = require('mongo-dot-notation');

describe('portUserUpdate', () => {
    let usersDb, user;

    beforeAll(async () => {
        usersDb = await makeUsersDb({ makeDb: startDb, operator: $ });
    });

    beforeEach(async () => {
        user = makeFakeUser();
        await usersDb.insertOne(user);
    });

    afterEach(async () => {
        await clearDb();
    });

    it('should update a user', async () => {
        const userIsEqual = (userA, userB) => _.isEqual(userA, userB);
        const updateUser = makeUpdateUser({ usersDb, userIsEqual });

        // Modify user's name.
        user.name.displayName = 'Guillem';
        // Update the user modified.
        let updatedUser = await updateUser({
            _id: user._id,
            name: user.name
        });
        expect(user).toEqual(updatedUser);
    });
});
