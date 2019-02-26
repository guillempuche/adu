/**
 * API for faculty information.
 *
 * Methods:
 * - `get /api/faculties/checkId`
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
    app.get('/api/faculties/checkId', requireLogin, async (req, res) => {
        const { id } = req.query;
        try {
            const faculty = await Faculty.findById({
                _id: id
            });

            if (faculty) res.send(true);
            else
                throw Error(
                    `Code=${id} isn't equal to any faculty's id. Fetched by user=${
                        req.user.id
                    }.`
                );
        } catch (err) {
            // 404 === Not found
            logger.warn(
                `#API statusCode=404 Code=${id} isn't equal to any faculty's id. Fetched by user=${
                    req.user.id
                }. ${err}`
            );
            res.send(false);
        }
    });
};
