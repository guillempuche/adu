const logger = require('../utils/logger').logger(__filename);

/**
 * If user is logged, do nothing (=== pass to the next middleware).
 * If user isn't logged, then return `false` without passing to the
 * next middleware (with `next` function).
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
module.exports = (req, res, next) => {
    if (!req.user) {
        // 401 === Unauthorized
        logger.warn(
            '#login 401 Unauthorized. Trying to get user cookie, but not found it.'
        );

        res.status(401).send(false);
        return;
    }

    res.requireLogin = false;
    next();
};
