'use strict';

const { usersDb } = require('../../../src/secondaryAdapters/db');
const { clearDb } = require('./localDb');
const { buildFakeUser } = require('../../utils/faker');

describe('sa:db:usersDb', () => {
	let user;

	beforeEach(async () => {
		user = buildFakeUser();
		await usersDb.insertOne(user);
	});

	afterAll(async () => {
		await clearDb();
	});

	it('should insert one user', async () => {
		user = buildFakeUser();
		const userInserted = await usersDb.insertOne(user);
		expect(userInserted).toEqual(user);
	});

	it('should find one user by id', async () => {
		let userFound = await usersDb.findById(user._id);
		expect(userFound).toEqual(user);

		userFound = await usersDb.findById(user.auth0Id);
		expect(userFound).toEqual(user);
	});

	it(`shouldn't find user by id`, async () => {
		const userFound = await usersDb.findById('1234');
		expect(userFound).toBeNull();
	});

	it('should update one user', async () => {
		const userUpdated = await usersDb.updateOne({
			...user,
			displayName: 'GPQ'
		});

		expect(userUpdated._id).toBe(user._id);
		expect(userUpdated.roles).toBe(user.roles);
		expect(userUpdated.displayName).toBe('GPQ');
	});
});
