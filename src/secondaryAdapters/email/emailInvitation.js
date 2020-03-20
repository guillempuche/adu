'use strict';

const logger = require('../../utils/logger')('sa:email');

/**
 * Send invitation (via email) to allow the receiver to sign up.
 * @param {Object} param
 * @param {Object} param.provider Email provider adapter.
 * @return {sendInvitation(): void}
 */
module.exports = function makeSendInvitation({ provider }) {
	if (!provider) throw new Error(`Provider isn't supplied.`);

	/**
	 * Send an invitation to an email address.
	 *
	 * More info about Mailjet:
	 * - https://dev.mailjet.com/email/guides/getting-started/#send-your-first-email
	 * - https://dev.mailjet.com/email/guides/send-api-v31/#use-a-template
	 * @async
	 * @param {Object} param
	 * @param {string} param.facultyId
	 * @param {string} param.code Code for the receiver to able to sign up.
	 * @param {string} param.nameSender
	 * @param {string} param.emailSender
	 * @param {string} param.emailReceiver
	 * @return {({messageId: string, messageHref: string}|null)}
	 */
	const sendInvitation = async ({
		facultyId,
		code,
		nameSender,
		emailSender,
		emailReceiver
	}) => {
		logger.debug('Sending the invitation email...', {
			facultyId,
			code,
			nameSender,
			emailSender,
			emailReceiver
		});

		if (
			!facultyId ||
			!code ||
			!nameSender ||
			!emailSender ||
			!emailReceiver
		) {
			logger.error(`sendInvitation hasn't all arguments supplied.`);
			throw "sendInvitation hasn't all arguments supplied.";
		}
		try {
			const response = await provider
				.post('send', { version: 'v3.1' })
				.request({
					Messages: [
						{
							From: {
								Email: process.env.MAILJET_EMAIL_AU,
								Name: nameSender
							},
							To: [
								{
									Email: emailReceiver
								}
							],
							ReplyTo: {
								Email: emailSender,
								Name: nameSender
							},
							TemplateID: parseInt(
								process.env.MAILJET_TEMPLATE_INVITATION,
								10
							),
							TemplateLanguage: true,
							Subject: 'Invitación para Au',
							Variables: {
								nameSender,
								emailSender,
								facultyId,
								code
							}
						}
					]
				});
			const data = response.body.Messages[0].To[0];
			const result = {
				messageId: data.MessageID,
				messageHref: data.MessageHref
			};
			logger.info('Invitation email has been sent.', result);
			return result;
		} catch (err) {
			logger.error('Error on sending the invitaion email.', err);
			return null;
		}
	};

	return sendInvitation;
};
