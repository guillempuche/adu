'use strict';

const { createLogger, format, transports } = require('winston');
const {
	combine,
	errors,
	printf,
	label,
	ms,
	colorize,
	metadata,
	align
} = format;

/**
 * Logger with Winston
 * @param {string} context About the function that the logger is operating.
 */
module.exports = context => {
	/**
	 * Set up the logger with Winston which will allow us to set log level
	 * according to the context.
	 */
	if (process.env.NODE_ENV !== 'production') {
		// More about custom formats on: https://github.com/winstonjs/logform
		const customFormat = combine(
			label({
				label: typeof context === 'string' ? context.toUpperCase() : '',
				message: false
			}),
			metadata(),
			ms(),
			// Add a \t delimiter before the message to align it in the same place.
			align(),
			printf(
				info =>
					`${info.level.toUpperCase()} [${info.metadata.label}] ${
						info.ms
					}: ${info.message || ''} ${
						delete info.metadata.label &&
						Object.keys(info.metadata).length === 0
							? ''
							: '\n\t' + JSON.stringify(info.metadata)
					}`
			)
		);

		return createLogger({
			// Set the logging level.
			level: process.env.NODE_ENV === 'debug' ? 'debug' : 'info',
			// The Error's stack property is appended to the info object.
			// To catch correctly the Errors, format.errors has to be on the parent logger.
			// More about this bug on: https://github.com/winstonjs/winston/issues/1338#issuecomment-537481141
			format: errors({ stack: true }),
			transports: [
				new transports.Console({
					format: combine(customFormat, colorize({ all: true }))
				})
			]
		});
	}
};
