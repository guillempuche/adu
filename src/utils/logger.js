/**
 * Logger with Winston, Morgan and Stackify.
 *
 * UUID https://www.npmjs.com/package/morgan#use-custom-token-formats
 */
'use strict';

const _ = require('lodash');
const keys = require('../config/keys');
const path = require('path');
var { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, label, ms, colorize, metadata } = format;
const morgan = require('morgan');
var stackify = require('stackify-logger');

/**
 * Stockify logging tool setting.
 * start() method sets a handler for uncaught exceptions. Make sure it runs
 * before any methods that set exception handlers.
 */
const stackifyUncaughtException = stackify.start({
    apiKey: keys.stackifyKey,
    env: keys.stackifyEnv,
    debug: process.env.NODE_ENV === 'production' ? false : true
});
require('winston-stackify').Stackify;

/**
 * Set up the logger with Winston which will allow us to set log level
 * according to the environment and also print the timestamp for every log.
 */
var logger = filePathName => {
    if (process.env.NODE_ENV !== 'production') {
        const customFormat = combine(
            metadata(),
            label({ label: path.basename(filePathName) }),
            timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            ms(),
            printf(
                info =>
                    `${info.timestamp} ${info.ms} ${info.level} [${
                        info.label
                    }]: ${info.message || info.error} ${JSON.stringify(
                        info.metadata
                    )}`
            )
        );
        return new createLogger({
            level: 'debug', // Always debugging on development
            format: label({ label: path.basename(filePathName) }), // Format for all transports.
            transports: [
                new transports.File({
                    filename: './logs/all-logs.log',
                    handleExceptions: true,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                }),
                new transports.Console({
                    format: combine(customFormat, colorize({ all: true }))
                }),
                new transports.Stackify({
                    storage: stackify,
                    handleExceptions: true
                })
            ],
            exitOnError: false // do not exit on handled exceptions
        });
    } else {
        return new createLogger({
            /**
             * If the `level` is not passed explicitly then the default level is
             * made `debug` meaning that all levels above `debug` including `debug`
             * itself would be logged.
             */
            level: keys.logLevel,
            format: combine(
                metadata(),
                label({ label: path.basename(filePathName) }),
                timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                ms(),
                printf(
                    info =>
                        `${info.timestamp} ${info.ms} ${info.level} [${
                            info.label
                        }]: ${info.message} ${JSON.stringify(info.metadata)}`
                )
            ),
            transports: [
                new transports.File({
                    filename: './logs/all-logs.log',
                    handleExceptions: true,
                    json: true,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5
                }),
                new transports.Stackify({
                    storage: stackify,
                    handleExceptions: true
                })
            ],
            exitOnError: false // do not exit on handled exceptions
        });
    }
};

/**
 * Options object accepted by Morgan.
 *
 * @property {function} `write` - Create a stream object with a 'write'
 * function that will be used by `morgan`. By default, morgan outputs
 * to the console only, so let's define a stream function that will be able to get morgan-generated output into the winston log files.
 */
const loggerMorgan = {
    write: function(message, encoding) {
        // use the 'info' log level so the output will be picked up by both
        // transports (file and console).
        logger(__filename).info(message);
        /*if (process.env.NODE_ENV !== 'production')
        else logger(__filename).log(message);
        */
    }
};

/**
 * We use the stream option and set it to the stream interface we
 * created before as part of the winston configuration.
 *
 * @param {object} app - Express app.
 */
const settingMorgan = app => {
    // More info: https://medium.com/front-end-weekly/node-js-logs-in-local-timezone-on-morgan-and-winston-9e98b2b9ca45
    morgan.token('userId', (req, res) => {
        const { user } = req;
        return user ? user.id : 'undefined';
    });

    // Custom format.
    morgan.format(
        'customFormat',
        '#HttpRequest userId=:userId - [:date[clf]] ":method :url" :status - :response-time ms'
    );

    /**
     * @param {function} morgan - Morgan logger middleware with given
     * `format` and `options`. `immediate`: requests will be logged even
     * if the server crashes, but data from the response (like the
     * response code, content length...) cannot be logged.
     */
    app.use(
        morgan('customFormat', {
            immediate: true,
            stream: loggerMorgan
        })
    );
};

/**
 * Main error handler
 *
 * @param {object} app - Express app.
 */
const errorHandler = app => {
    app.use((err, req, res, next) => {
        if (err) {
            logger(__filename).error('[Main Error Handler] ' + err.stack);
            res.status(status);
            res.send(err);
        }
    });
};

module.exports = {
    stackifyUncaughtException,
    logger,
    settingMorgan,
    errorHandler
};
