'use strict';

const makeSendInvitation = require('../../../src/secondaryAdapters/email/emailInvitation');
const { mailjet } = require('../../../src/secondaryAdapters/email/provider');

describe('sa:email', () => {
	it('should sent an invitation email', async () => {
		const sendInvitation = makeSendInvitation({ provider: mailjet });
		const result = await sendInvitation({
			facultyId: '123asd123',
			code: '1234',
			nameSender: 'Guillem',
			emailSender: process.env.MAILJET_TEST_EMAIL_INVITATION,
			emailReceiver: process.env.MAILJET_TEST_EMAIL_INVITATION
		});

		expect(result).toBeTruthy();
		expect(result.messageId).toBeTruthy();
		expect(result.messageHref).toBeTruthy();
	});
});
