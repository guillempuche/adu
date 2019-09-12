/**
 * Return all users from a specfic faculty.
 */
module.exports = function makeListAllUsersFromFaculty({ usersDb }) {
    return async function listAllUsersFromFaculty({ facultyId }) {
        if (!facultyId) {
            throw new Error(`You must supply a faculty's id.`);
        }

        const users = await usersDb.findByFacultyId({
            _id: facultyId
        });

        if (!users) {
            throw new Error(`Users not found with this faculty's id.`);
        }

        return users;
    };
};
