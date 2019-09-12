'use strict';

const _ = require('lodash');
const makeAddUser = require('./portUserAdd');
const makeUpdateUser = require('./portUserUpdate');
const makeAddUserFaculty = require('./portUserAddFaculty');
const makeListAllUsersFromFaculty = require('./portUsersListFromFaculty');
const { usersDb } = require('../../secondaryAdapters/db');

const userIsEqual = (userA, userB) => _.isEqual(userA, userB);
const cloneUser = userToClone => _.cloneDeep(userToClone);

const addUser = makeAddUser({ usersDb });
const updateUser = makeUpdateUser({ usersDb, userIsEqual });
const addUserFaculty = makeAddUserFaculty({ usersDb, cloneUser });
const listAllUsersFromFaculty = makeListAllUsersFromFaculty({ usersDb });

module.exports = {
    addUser,
    updateUser,
    addUserFaculty,
    listAllUsersFromFaculty
};
