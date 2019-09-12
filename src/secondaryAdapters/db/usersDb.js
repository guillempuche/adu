/**
 * MongoDB docs: https://docs.mongodb.com/manual/
 * MongoDB reference: http://mongodb.github.io/node-mongodb-native/3.3/reference
 * MongoDB API: https://mongodb.github.io/node-mongodb-native/3.3/api
 */
module.exports = function makeUsersDb({ makeDb, createObjectId, operator }) {
    if (!makeDb) throw new Error(`makeDb isn't supplied.`);

    return Object.freeze({
        findById,
        findByFacultyId,
        insertOne,
        updateOne
    });

    /**
     * Find a user according to an id.
     * @param {string} id
     * @return {?Object}
     */
    async function findById(id) {
        try {
            const db = await makeDb();
            const result = await db.collection('users').findOne({ _id: id });
            return result ? result : null;
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Find all users linked with an specific faculty.
     * @param {string} id
     * @return {?Array}
     */
    async function findByFacultyId(id) {
        const db = await makeDb();
        const result = await db
            .collection('users')
            .find({ _faculties: createObjectId(id) });
        const found = await result.toArray();

        if (found.length === 0) return null;

        return found;
    }

    /**
     * Insert one user (it must contains `_id`).
     * @param {Object} user
     * @return {Object} User inserted.
     */
    async function insertOne(user) {
        try {
            const db = await makeDb();
            await db.collection('users').insertOne(user);
            return user;
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Update one user (it must contains `_id`).
     * @param {Object} user
     * @return {Object} User updated.
     */
    async function updateOne({ _id, ...rest }) {
        try {
            if (!operator) throw new Error(`Operator isn't supplied.`);

            const db = await makeDb();
            const result = await db
                .collection('users')
                .updateOne({ _id }, operator.flatten({ ...rest }));
            return result.modifiedCount > 0 ? { _id, ...rest } : null;
        } catch (err) {
            console.error(err);
        }
    }
};
