const {
    updateUser,
    addUserFaculty,
    listAllUsersFromFaculty
} = require('../../../ports/user');
const makePutUpdateUser = require('./putUpdateUser');
const makeAddUserFaculty = require('./postUserFaculty');
const makeGetAllUsersFromFaculty = require('./getAllUsersFromFaculty');

const putUpdateUser = makePutUpdateUser({ updateUser });
const postUserFaculty = makeAddUserFaculty({ addUserFaculty });
const getAllUsersFromFaculty = makeGetAllUsersFromFaculty({
    listAllUsersFromFaculty
});

module.exports = {
    putUpdateUser,
    postUserFaculty,
    getAllUsersFromFaculty
};
