module.exports = {
	// More on: https://dev.mailjet.com/email/reference/send-emails/
	sendEmail: {
		Messages: [
			{
				Status: 'success',
				CustomID: '',
				To: [
					{
						Email: 'test@test.com',
						MessageUUID: 'A1234',
						MessageID: 1234,
						MessageHref:
							'https://api.mailjet.com/v3/REST/message/B1234'
					}
				],
				Cc: [],
				Bcc: []
			}
		]
	}
};
