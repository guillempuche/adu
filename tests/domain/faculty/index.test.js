'use strict';

const { buildFaculty } = require('../../../src/domains/faculty');

describe('d:faculty', () => {
	it(`should be a function`, () => {
		expect(typeof buildFaculty).toBe('function');
	});

	it('should create a faculty', () => {
		let result;

		// ### Create a faculty ###
		const faculty = {
			_id: 'id',
			name: 'Faculty A',
			invitations: [
				{
					code: 'code',
					email: 'test@email.com',
					// All roles available.
					roles: [
						'superadmin',
						'faculty-admin',
						'agent',
						'user',
						'visitor'
					],
					createdAt: 1234567890123
				}
			]
		};
		result = buildFaculty(faculty);

		expect(result).toHaveProperty('getFaculty');
		expect(result.getFaculty()).toEqual(faculty);

		expect(result).toHaveProperty('getId');
		expect(typeof result.getId()).toBe('string');
		expect(result.getId()).toBe(faculty._id);

		expect(result).toHaveProperty('getName');
		expect(typeof result.getName()).toBe('string');
		expect(result.getName()).toBe(faculty.name);

		expect(result).toHaveProperty('getInvitations');
		expect(result.getInvitations()[0]).toEqual(faculty.invitations[0]);
		expect(result.getInvitations()[0].code).toBe(
			faculty.invitations[0].code
		);
		expect(result.getInvitations()[0].email).toBe(
			faculty.invitations[0].email
		);
		expect(result.getInvitations()[0].roles).toEqual(
			faculty.invitations[0].roles
		);
		expect(result.getInvitations()[0].createdAt.toString().length).toBe(13);

		// Autocreate a default faculty.
		result = buildFaculty();
		expect(typeof result.getId()).toBe('string');
		expect(result.getName()).toBe(undefined);
		expect(result.getInvitations()).toEqual([]);
	});

	it(`shouldn't create a faculty`, () => {
		// Invalid id.
		expect(() => {
			buildFaculty({ _id: 1 });
		}).toThrow();

		// Invalid name.
		expect(() => {
			buildFaculty({ name: 1 });
		}).toThrow();
	});

	it(`shouldn't create an invitation`, () => {
		// `code` required.
		expect(() => {
			buildFaculty({
				invitations: [
					{
						email: 'test@email.com',
						roles: ['agent'],
						createdAt: 1234567890123
					}
				]
			});
		}).toThrow();

		// `email` required.
		expect(() => {
			buildFaculty({
				invitations: [
					{
						code: 'code',
						roles: ['agent'],
						createdAt: 1234567890123
					}
				]
			});
		}).toThrow();

		// `roles` required.
		expect(() => {
			buildFaculty({
				invitations: [
					{
						code: 'code',
						email: 'test@email.com',
						createdAt: 1234567890123
					}
				]
			});
		}).toThrow();

		// `createdAt` required.
		expect(() => {
			buildFaculty({
				invitations: [
					{
						code: 'code',
						email: 'test@email.com',
						roles: ['agent']
					}
				]
			});
		}).toThrow();

		// Invalid code type.
		expect(() => {
			buildFaculty({
				invitations: [
					{
						code: 1,
						email: 'test@email.com',
						roles: ['agent'],
						createdAt: 1234567890123
					}
				]
			});
		}).toThrow();

		// Invalid email
		expect(() => {
			buildFaculty({
				invitations: [
					{
						code: 'code',
						email: 'text',
						roles: ['agent'],
						createdAt: 1234567890123
					}
				]
			});
		}).toThrow();

		// Invalid role.
		expect(() => {
			buildFaculty({
				invitations: [
					{
						code: 'code',
						email: 'test@email.com',
						roles: ['invalid'],
						createdAt: 1234567890123
					}
				]
			});
		}).toThrow();

		// Invalid createdAt, it must be number of 13-digits.
		expect(() => {
			buildFaculty({
				invitations: [
					{
						code: 'code',
						email: 'test@email.com',
						roles: ['agent'],
						createdAt: 'text'
					}
				]
			});
		}).toThrow();
	});
});
