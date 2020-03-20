'use strict';

const { buildUser } = require('../../../src/domains/user');

describe('d:user', () => {
	it(`should be a function`, () => {
		expect(typeof buildUser).toBe('function');
	});

	it.only('should create a user', () => {
		let result;

		// ### Create a user ###
		const user = {
			_id: 'id',
			auth0Id: 'id',
			displayName: 'name',
			fullName: 'name name',
			emails: { auth: 'test@email.com', account: 'test@email.com' },
			profilePicture: 'http://url.com',
			organizations: [
				{
					type: 'faculty',
					_id: 'id',
					// All roles available.
					roles: [
						'superadmin',
						'faculty-admin',
						'agent',
						'user',
						'visitor'
					]
				}
			]
		};
		result = buildUser(user);

		expect(result).toHaveProperty('getUser');
		expect(result.getUser()).toEqual(user);

		expect(result).toHaveProperty('getId');
		expect(typeof result.getId()).toBe('string');
		expect(result.getId()).toBe(user._id);

		expect(result).toHaveProperty('getAuth0Id');
		expect(typeof result.getAuth0Id()).toBe('string');

		expect(result).toHaveProperty('getDisplayName');
		expect(typeof result.getDisplayName()).toBe('string');
		expect(result.getDisplayName()).toBe(user.displayName);

		expect(result).toHaveProperty('getFullName');
		expect(typeof result.getFullName()).toBe('string');
		expect(result.getFullName()).toBe(user.fullName);

		expect(result).toHaveProperty('getEmails');
		expect(typeof result.getEmails().auth).toBe('string');
		expect(typeof result.getEmails().account).toBe('string');
		expect(result.getEmails()).toEqual(user.emails);

		// expect(result).toHaveProperty('getRoles');
		// expect(Array.isArray(result.getRoles())).toBe(true);
		// expect(result.getRoles()).toEqual(user.roles);

		expect(result).toHaveProperty('getOrganizations');
		expect(Array.isArray(result.getOrganizations())).toBe(true);
		expect(result.getOrganizations()).toEqual(user.organizations);

		expect(result).toHaveProperty('getProfilePicture');
		expect(typeof result.getProfilePicture()).toBe('string');
		expect(result.getProfilePicture()).toEqual(user.profilePicture);

		// Autocreate a default user.
		result = buildUser();
		expect(typeof result.getId()).toBe('string');
		expect(result.getAuth0Id()).toBe(undefined);
		expect(result.getDisplayName()).toBe(undefined);
		expect(result.getFullName()).toBe(undefined);
		expect(result.getEmails()).toEqual({
			auth: undefined,
			account: undefined
		});
		// expect(result.getRoles()).toEqual(['visitor']);
		expect(result.getProfilePicture()).toBe(undefined);
		expect(result.getOrganizations()).toEqual([]);

		// // ### Faculties ###
		// // Autoclean duplicated faculties.
		// result = buildUser({ _faculties: ['facultyA', 'facultyA'] });
		// expect(result.getFaculties()).toEqual(['facultyA']);

		// ### Roles ###
		// expect(
		// 	buildUser({
		// 		roles: [
		// 			'superadmin',
		// 			'faculty-admin',
		// 			'agent',
		// 			'user',
		// 			'visitor'
		// 		]
		// 	}).getRoles()
		// ).toEqual(['superadmin', 'faculty-admin', 'agent', 'user', 'visitor']);
		expect(
			buildUser({
				organizations: [
					{
						type: 'faculty',
						_id: 'id',
						roles: [
							'superadmin',
							'faculty-admin',
							'agent',
							'user',
							'visitor'
						]
					}
				]
			}).getOrganizations()[0].roles
		).toEqual(['superadmin', 'faculty-admin', 'agent', 'user', 'visitor']);
		// expect(
		// 	buildUser({
		// 		organizations: [
		// 			{
		// 				type: 'faculty',
		// 				_id: 'id',
		// 				roles: []
		// 			}
		// 		]
		// 	}).getOrganizations()[0].roles
		// ).toEqual(['visitor']);
		// // Autocleaning of duplicated roles.
		// expect(
		// 	buildUser({
		// 		organizations: [
		// 			{
		// 				type: 'faculty',
		// 				_id: 'id',
		// 				roles: ['visitor', 'visitor']
		// 			}
		// 		]
		// 	}).getOrganizations()[0].roles
		// ).toEqual(['visitor']);
	});

	it(`shouldn't create a user`, () => {
		// Invalid id.
		expect(() => {
			buildUser({ _id: 1 });
		}).toThrow();

		// Invalid display name.
		expect(() => {
			buildUser({
				displayName: 1
			});
		}).toThrow();

		// Invalid full name.
		expect(() => {
			buildUser({
				fullName: 1
			});
		}).toThrow();

		// Invalid emails format.
		expect(() => {
			buildUser({
				emails: {
					auth: 'email'
				}
			});
		}).toThrow();
		expect(() => {
			buildUser({
				emails: {
					account: 'email'
				}
			});
		}).toThrow();

		// Invalid role. There's only predefined roles.
		expect(() => {
			buildUser({ roles: ['role'] });
		}).toThrow();

		// Wrong organizations array
		expect(() => {
			buildUser({ organizations: [{}] });
		}).toThrow();
		// Wrong type
		expect(() => {
			buildUser({
				organizations: [
					{
						type: 1,
						_id: 'id',
						roles: ['agent']
					}
				]
			});
		}).toThrow();
		// Wrong id
		expect(() => {
			buildUser({
				organizations: [
					{
						type: 'faculty',
						_id: 1,
						roles: ['agent']
					}
				]
			});
		}).toThrow();
		// Wrong role
		expect(() => {
			buildUser({
				organizations: [
					{
						type: 'faculty',
						_id: 'id',
						roles: ['role']
					}
				]
			});
		}).toThrow();
		// Can't be without roles
		expect(() => {
			buildUser({
				organizations: [
					{
						type: 'faculty',
						_id: 'id',
						roles: []
					}
				]
			});
		}).toThrow();
		// Duplicated role.
		expect(() => {
			buildUser({
				organizations: [
					{
						type: 'faculty',
						_id: 'id',
						roles: ['agent', 'agent']
					}
				]
			});
		}).toThrow();

		// Invalid uri.
		expect(() => {
			buildUser({ profilePicture: 'text' });
		}).toThrow();
	});
});
