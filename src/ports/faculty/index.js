'use strict';

const makeGetFaculty = require('./portFacultyGet');
const makeAddFacultyInvitation = require('./portFacultyAddInvitation');
const makeAddFaculty = require('./portFacultyAdd');
const { facultiesDb } = require('../../secondaryAdapters/db');
const { Id, UtcNow } = require('../../utils/generator');

const getFaculty = makeGetFaculty({
	facultiesDb
});
const addFacultyInvitation = makeAddFacultyInvitation({
	facultiesDb,
	Id,
	UtcNow
});
const addFaculty = makeAddFaculty({
	facultiesDb
});

module.exports = {
	getFaculty,
	addFacultyInvitation,
	addFaculty
};
