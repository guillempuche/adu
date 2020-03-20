'use strict';

const makeGetUser = require('./portUserGet');
const makeAddUser = require('./portUserAdd');
const makeUpdateUser = require('./portUserUpdate');
const { usersDb } = require('../../secondaryAdapters/db');
const _ = require('lodash');

const getUser = makeGetUser({ usersDb });
const addUser = makeAddUser({ usersDb });
const updateUser = makeUpdateUser({
	usersDb,
	isEqual: _.isEqual,
	cloneDeep: _.cloneDeep,
	merge: _.merge
});

module.exports = {
	getUser,
	addUser,
	updateUser
};
