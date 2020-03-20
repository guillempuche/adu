'use strict';

const makeSendInvitation = require('./emailInvitation');
const { mailjet } = require('./provider.js');

const sendInvitation = makeSendInvitation({ provider: mailjet });

module.exports = {
	sendInvitation
};
