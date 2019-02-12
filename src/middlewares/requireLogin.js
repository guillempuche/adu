const logger = require('../utils/logger').logger(__filename);

module.exports = (req, res, next) => {
    if (!req.user) {
        logger.warn('#login You must to login.');
        return res.status(401).send({ error: 'You must to log in!' });
    }

    next();
};
