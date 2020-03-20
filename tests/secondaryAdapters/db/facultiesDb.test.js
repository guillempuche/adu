'use strict';

const { facultiesDb } = require('../../../src/secondaryAdapters/db');
const { clearDb } = require('./localDb');
const { buildFakeFaculty } = require('../../utils/faker');

describe('sa:db:facultiesDb', () => {
	let faculty;

	beforeEach(async () => {
		faculty = buildFakeFaculty();
		await facultiesDb.insertOne(faculty);
	});

	afterAll(async () => {
		await clearDb();
	});

	it('should insert one faculty', async () => {
		faculty = buildFakeFaculty();
		const facultyInserted = await facultiesDb.insertOne(faculty);
		expect(facultyInserted).toEqual(faculty);
	});

	it('should find one faculty by id', async () => {
		const facultyFound = await facultiesDb.findById(faculty._id);
		expect(facultyFound).toEqual(faculty);
	});

	it(`shouldn't find any faculty by id`, async () => {
		const facultyFound = await facultiesDb.findById('1234');
		expect(facultyFound).toBeNull();
	});

	it('should update one faculty', async () => {
		const oldName = faculty.name;
		faculty.name = 'New Name';
		const facultyUpdated = await facultiesDb.updateOne({ ...faculty });

		expect(facultyUpdated._id).toBe(faculty._id);
		expect(facultyUpdated.name).not.toBe(oldName);
		expect(facultyUpdated.invitations.length).toBe(
			faculty.invitations.length
		);
		expect(facultyUpdated.invitations[0]).toEqual(faculty.invitations[0]);
	});
});
