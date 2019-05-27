/**
 * API for faculty information.
 *
 * Methods:
 * - `get /api/faculties/:id`
 */
'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger').logger(__filename);
const requireLogin = require('../middlewares/requireLogin');

const Faculty = mongoose.model('faculties');

module.exports = app => {
    /**
     * Check if faculty exist.
     * @return {boolean} - `true` if faculty existm, else `false`.
     */
    app.get('/api/faculties/:facultyId', requireLogin, async (req, res) => {
        const { facultyId } = req.params;
        try {
            const faculty = await Faculty.findById(facultyId);

            if (faculty) res.send(true);
            else
                throw Error(
                    `Code=${facultyId} isn't equal to any faculty's id. Fetched by user=${
                        req.user.id
                    }.`
                );
        } catch (err) {
            // 404 === Not found
            logger.warn(
                `#API statusCode=404 Code=${facultyId} isn't equal to any faculty's id. Fetched by user=${
                    req.user.id
                }. ${err}`
            );
            res.send(false);
        }
    });
};
