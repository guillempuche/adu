'use strict';

const mailjet = require('node-mailjet').connect(
	process.env.MAILJET_APIKEY_PUBLIC,
	process.env.MAILJET_APIKEY_PRIVATE
);

module.exports = {
	mailjet
};
