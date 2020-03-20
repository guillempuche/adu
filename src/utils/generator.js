'use strict';

const cuid = require('cuid');

/**
 * @property {function} Id
 * @property {function} UtcNow Return UTC of 13 digits (milliseconds)
 */
module.exports = Object.freeze({
	Id: cuid,
	UtcNow: () => Date.now()
});
