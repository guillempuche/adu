/**
 * API for the FAQs.
 *
 * Methods:
 * - `get /api/settings` Get all settings
 */
'use strict';

const requireLogin = require('../middlewares/requireLogin');
const logger = require('../utils/logger').logger(__filename);

const AppSettings = require('../models/AppSettings');

module.exports = app => {
    /**
     * Get all settings.
     */
    app.get('/api/settings', requireLogin, async (req, res) => {
        try {
            const settings = await AppSettings.find().lean();

            res.send(settings);
        } catch (err) {
            logger.error(`#API Error on getting all settings. ${err}`);

            // Bad Request
            res.status(400).send(false);
        }
    });
};
