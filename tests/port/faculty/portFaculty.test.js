'use strict';

const {
	getFaculty,
	addFacultyInvitation,
	addFaculty
} = require('../../../src/ports/faculty');
const { clearDb } = require('../../secondaryAdapters/db/localDb');
const { buildFakeFaculty } = require('../../utils/faker');

describe('ports:faculty', () => {
	let faculty, newInvitation;

	beforeEach(async () => {
		faculty = buildFakeFaculty();
		await addFaculty(faculty);
	});

	afterAll(async () => {
		await clearDb();
	});

	it('index.js should export functions', () => {
		expect(typeof getFaculty).toBe('function');
		expect(typeof addFacultyInvitation).toBe('function');
		expect(typeof addFaculty).toBe('function');
	});

	it('should throw errors in every port because of invalid arguments', async () => {
		// Port get
		expect(() => {
			require('../../../src/ports/faculty/portFacultyGet')();
		}).toThrow();
		await expect(getFaculty({ _id: 1 })).rejects.toBeTruthy();

		// Port add
		expect(() => {
			require('../../../src/ports/faculty/portFacultyAdd')();
		}).toThrow();
		await expect(addFaculty('test')).rejects.toBeTruthy();

		// Port add invitation
		expect(() => {
			require('../../../src/ports/faculty/portFacultyAddInvitation')();
		}).toThrow();
		await expect(
			addFacultyInvitation({ _id: 'test' })
		).rejects.toBeTruthy();
	});

	it('should get the faculty', async () => {
		const foundFaculty = await getFaculty({
			_id: faculty._id
		});
		expect(foundFaculty).toEqual(faculty);
	});

	it(`shouldn't get the faculty`, async () => {
		const foundFaculty = await getFaculty({
			_id: '1'
		});
		expect(foundFaculty).toBeNull();
	});

	it('should add a faculty', async () => {
		faculty = buildFakeFaculty();
		const facultyAdded = await addFaculty(faculty);
		expect(facultyAdded).toEqual(faculty);
	});

	it('should add a new faculty invitation', async () => {
		let updatedFaculty;

		newInvitation = {
			email: 'test@email.com',
			code: 'code',
			roles: ['superadmin', 'faculty-admin', 'agent', 'user', 'visitor']
		};
		// Add an invitation to the expected faculty.
		faculty.invitations.push(newInvitation);
		updatedFaculty = await addFacultyInvitation({
			_id: faculty._id,
			email: newInvitation.email,
			roles: newInvitation.roles
		});
		expect(updatedFaculty._id).toEqual(faculty._id);
		expect(updatedFaculty.name).toEqual(faculty.name);
		expect(updatedFaculty.invitations.length).toEqual(
			faculty.invitations.length
		);
		// Only email and roles will be equal, because `addFacultyInvitation`
		// has to autogenerate `code` and `createdAt`.
		expect(updatedFaculty.invitations[0].email).toBe(
			faculty.invitations[0].email
		);
		expect(updatedFaculty.invitations[0].roles).toEqual(
			faculty.invitations[0].roles
		);
		expect(updatedFaculty.invitations[0]).toHaveProperty('code');
		expect(typeof updatedFaculty.invitations[0].code).toBe('string');
		expect(updatedFaculty.invitations[0]).toHaveProperty('createdAt');
		expect(typeof updatedFaculty.invitations[0].createdAt).toBe('number');
		expect(updatedFaculty.invitations[0].createdAt.toString().length).toBe(
			13
		);

		// Autocleaning of duplicated roles.
		updatedFaculty = await addFacultyInvitation({
			_id: faculty._id,
			email: newInvitation.email,
			roles: ['agent', 'agent', 'agent']
		});
		let lastIndex = updatedFaculty.invitations.length - 1;
		expect(updatedFaculty.invitations[lastIndex].roles).toEqual(['agent']);

		// Empty list of roles.
		updatedFaculty = await addFacultyInvitation({
			_id: faculty._id,
			email: newInvitation.email,
			roles: []
		});
		lastIndex = updatedFaculty.invitations.length - 1;
		expect(updatedFaculty.invitations[lastIndex].roles).toEqual(['agent']);
	});

	it(`shouldn't add a new faculty invitation`, async () => {
		// Wrong faculty id.
		await expect(
			addFacultyInvitation({
				_id: '1234',
				email: 'a@a.com',
				roles: ['agent']
			})
		).resolves.toBeNull();
	});
});
