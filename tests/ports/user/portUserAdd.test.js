'use strict';

const makeAddUser = require('../../../src/ports/user/portUserAdd');
const makeUsersDb = require('../../../src/secondaryAdapters/db/usersDb');
const { startDb, clearDb } = require('../../secondaryAdapters/db/localDb');
const makeFakeUser = require('../../utils/faker/user');
// Library to transform objects to mongo update instructions using operators. https://www.npmjs.com/package/mongo-dot-notation
const $ = require('mongo-dot-notation');

describe('portUserAdd', () => {
    let usersDb;

    beforeAll(async () => {
        usersDb = await makeUsersDb({ makeDb: startDb });
    });

    afterEach(async () => {
        await clearDb();
    });

    it('should add one user in the database', async () => {
        const user = makeFakeUser();
        const addUser = makeAddUser({ usersDb });
        const userAdded = await addUser(user);
        expect(user).toMatchObject(userAdded);
    });
});
