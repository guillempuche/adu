'use strict';

const server = require('./server');
const { setMorgan, logger } = require('../../../secondaryAdapters/logging');

module.exports = server({ setMorgan, logger });
