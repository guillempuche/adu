const makeUsersDb = require('../../../src/secondaryAdapters/db/usersDb');
const { startDb, clearDb } = require('./localDb');
const makeFakeUser = require('../../utils/faker/user');
const $ = require('mongo-dot-notation');

describe('usersDb', () => {
    let usersDb, user;

    beforeAll(async () => {
        usersDb = makeUsersDb({ makeDb: startDb });
    });

    afterEach(async () => {
        //await clearDb();
    });

    it('should insert one user', async () => {
        user = makeFakeUser();
        const userInserted = await usersDb.insertOne(user);

        expect(userInserted).toEqual(user);
    });

    it('should find a user by id', async () => {
        user = makeFakeUser();
        await usersDb.insertOne(user);

        const userFound = await usersDb.findById(user._id);
        expect(user).toEqual(userFound);
    });

    it('should update one user', async () => {
        usersDb = makeUsersDb({ makeDb: startDb, operator: $ });
        user = makeFakeUser();
        await usersDb.insertOne(user);

        const oldDisplayName = user.name.displayName;
        user.name.displayName = 'Guillem';
        const userUpdated = await usersDb.updateOne({ ...user });

        expect(user._id).toBe(userUpdated._id);
        expect(user.roles).toBe(userUpdated.roles);
        expect(oldDisplayName).not.toBe(userUpdated.name.displayName);
    });
});
