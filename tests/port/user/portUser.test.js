'use strict';

const { getUser, addUser, updateUser } = require('../../../src/ports/user');
const { clearDb } = require('../../secondaryAdapters/db/localDb');
const { buildFakeUser } = require('../../utils/faker');

describe('ports:user', () => {
	let user;

	beforeEach(async () => {
		user = await addUser(buildFakeUser());
	});

	afterAll(async () => {
		await clearDb();
	});

	it('index.js should export functions', () => {
		expect(typeof getUser).toBe('function');
		expect(typeof addUser).toBe('function');
		expect(typeof updateUser).toBe('function');
	});

	it('should throw errors in every port because of invalid arguments', async () => {
		// Without arguments
		expect(() => {
			require('../../../src/ports/user/portUserGet')();
		}).toThrow();
		// Without a string id.
		await expect(getUser({ id: 1 })).rejects.toBeTruthy();

		// On port add
		expect(() => {
			require('../../../src/ports/user/portUserAdd')();
		}).toThrow();
		// Without user object.
		await expect(addUser('test')).rejects.toBeTruthy();

		// Without 'usersDb'
		expect(() => {
			require('../../../src/ports/user/portUserUpdate')({
				isEqual: () => {},
				cloneDeep: () => {},
				merge: () => {}
			});
		}).toThrow();
		// Without 'isEqual'
		expect(() => {
			require('../../../src/ports/user/portUserUpdate')({
				usersDb: () => {},
				cloneDeep: () => {},
				merge: () => {}
			});
		}).toThrow();
		// Without 'cloneDeep'
		expect(() => {
			require('../../../src/ports/user/portUserUpdate')({
				usersDb: () => {},
				isEqual: () => {},
				merge: () => {}
			});
		}).toThrow();
		// Without 'merge'
		expect(() => {
			require('../../../src/ports/user/portUserUpdate')({
				usersDb: () => {},
				isEqual: () => {},
				cloneDeep: () => {}
			});
		}).toThrow();
		// Without string _id.
		await expect(updateUser({ test: 'test' })).rejects.toBeTruthy();
		// First argument can't have 'organizations'.
		await expect(
			updateUser({ _id: 'id', organizations: [] })
		).rejects.toBeTruthy();
	});

	it('should get one user', async () => {
		// We can get the user using: user id or user auth0Id.
		await expect(getUser({ id: user._id })).resolves.toEqual(user);
		await expect(getUser({ id: user.auth0Id })).resolves.toEqual(user);
	});

	it(`shouldn't get any user`, async () => {
		await expect(getUser({ id: '1234' })).resolves.toBeNull();
	});

	it('should add a user', async () => {
		user = buildFakeUser();
		await expect(addUser(user)).resolves.toEqual(user);
	});

	it('should update a user', async () => {
		let updatedUser, length;
		const newOrganizations = [
			{ type: 'faculty', _id: 'idA', roles: ['agent', 'agent'] },
			{ type: 'faculty', _id: 'idB', roles: ['visitor', 'visitor'] }
		];

		// Update displayNme.
		updatedUser = await updateUser({
			_id: user._id,
			displayName: 'name',
			emails: {
				auth: 'one@one.com'
			}
		});
		expect(updatedUser.displayName).toBe('name');
		// IMPORTANT: check the deep update of an object.
		// Only change the auth email, but account email.
		expect(updatedUser.emails.auth).toBe('one@one.com');
		expect(updatedUser.emails.account).toBe(user.emails.account);

		// Add two organizations + autoclean duplicated roles.
		updatedUser = await updateUser(
			{
				_id: user._id
			},
			{ action: 'put', organizations: newOrganizations }
		);
		length = updatedUser.organizations.length;
		expect(length).toBe(user.organizations.length + 2);
		expect(updatedUser.organizations[length - 2].type).toEqual('faculty');
		expect(updatedUser.organizations[length - 1].type).toEqual('faculty');
		expect(updatedUser.organizations[length - 2]._id).toEqual('idA');
		expect(updatedUser.organizations[length - 1]._id).toEqual('idB');
		expect(updatedUser.organizations[length - 2].roles).toEqual(['agent']);
		expect(updatedUser.organizations[length - 1].roles).toEqual([
			'visitor'
		]);

		// Update two organizations + autoclean duplicated roles.
		updatedUser = await updateUser(
			{
				_id: user._id
			},
			{
				action: 'put',
				organizations: [
					{
						type: 'faculty',
						_id: 'idA',
						roles: ['superadmin', 'superadmin']
					},
					{
						type: 'faculty',
						_id: 'idB',
						roles: ['superadmin', 'superadmin']
					}
				]
			}
		);
		expect(updatedUser.organizations[length - 2].roles).toEqual([
			'superadmin'
		]);
		expect(updatedUser.organizations[length - 1].roles).toEqual([
			'superadmin'
		]);

		// Delete an organization.
		updatedUser = await updateUser(
			{
				_id: user._id
			},
			{
				action: 'delete',
				organizations: [{ type: 'faculty', _id: 'idB' }]
			}
		);
		expect(
			updatedUser.organizations[updatedUser.organizations.length - 1]._id
		).not.toBe('idB');
	});

	it(`shouldn't update a user`, async () => {
		// Wrong user id.
		await expect(
			updateUser({
				_id: '123'
			})
		).resolves.toBeNull();

		// Invalid action.
		await expect(
			updateUser(
				{
					_id: user._id
				},
				{
					action: 'action',
					organizations: [
						{
							type: 'faculty',
							_id: 'idA',
							roles: ['superadmin']
						}
					]
				}
			)
		).resolves.toBeNull();
	});
});
