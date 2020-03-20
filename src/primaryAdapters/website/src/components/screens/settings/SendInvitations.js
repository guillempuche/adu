import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@apollo/react-hooks';
import useForm from 'react-hook-form';

// Style
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import CircularProgress from '@material-ui/core/CircularProgress';
import DoneIcon from '@material-ui/icons/Done';

import { SEND_INVITATION, GET_ME } from '../../../graphql/fetch';

const useStyles = makeStyles(theme => ({
	layout: {
		...theme.mixins.gutters(),
		margin: theme.spacing(),
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(2)
	},
	form: {
		display: 'flex',
		alignItems: 'center'
	},
	title: {
		marginBottom: theme.spacing(2)
	},
	button: {
		margin: theme.spacing(1)
	},
	success: {
		display: 'flex',
		alignItems: 'center'
	}
}));

function Invitation() {
	const { register, handleSubmit, errors, watch } = useForm({
		mode: 'onChange'
	});
	const { data: query, error: errorQuery } = useQuery(GET_ME);
	const [
		sendInvitation,
		{ data: mutation, loading, called, error: errorMutation }
	] = useMutation(SEND_INVITATION);
	const classes = useStyles();
	const { t } = useTranslation(['settings', 'common']);

	if (errorQuery) console.error(errorQuery);
	if (errorMutation) console.error(errorMutation);
	if (!query || !query.getUser.success) return 'Loading...';
	return (
		<Paper className={classes.layout}>
			<div className={classes.title}>
				<Typography variant="body1" align="left">
					{t('invitations.title')}
				</Typography>
			</div>
			<div className={classes.form}>
				<div>{renderInput()}</div>
				<div>{renderSendButton()}</div>
				<div>{isSentSuccessfully()}</div>
			</div>
		</Paper>
	);

	/**
	 * Render text field where user writes the email. It also contains the form validation.
	 */
	function renderInput() {
		return (
			<TextField
				name="email"
				type="email"
				label={t('invitations.textfield-email')} // Title
				required={true}
				placeholder={t('invitations.placeholder-email')} // Background text
				error={errors.email ? true : false}
				helperText={errors.email && errors.email.message}
				variant="outlined"
				className={classes.textField}
				inputRef={register({
					required: t('common:form.validation-email-required'),
					pattern: {
						value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
						message: t('common:form.validation-email')
					}
				})}
			/>
		);
	}

	/**
	 * Render send button and handles the sending.
	 */
	function renderSendButton() {
		return (
			<Button
				variant="contained"
				color="secondary"
				disabled={
					watch('email') === undefined ||
					watch('email') === '' ||
					errors.email
						? true
						: false
				}
				className={classes.button}
				startIcon={<SendIcon />}
				onClick={handleSubmit(({ email }) => {
					console.log('Submitting form...');

					sendInvitation({
						variables: {
							facultyId: query.getUser.user._faculties[0],
							email
						}
					});
				})}
			>
				{t('invitations.button-send')}
			</Button>
		);
	}

	function isSentSuccessfully() {
		// Form isn't empty.
		if (watch('email') !== undefined && watch('email') !== '') {
			// Invitation is being sent.
			if (!mutation && called && loading) {
				return <CircularProgress size={25} color="secondary" />;
			}
			// Error
			else if (mutation && !mutation.sendInvitation.success) {
				return (
					<Typography color="error">
						{t('invitations.text-status-error')}
					</Typography>
				);
			}
			// Invitation sent successfully.
			else if (mutation && mutation.sendInvitation.success) {
				return (
					<div className={classes.success}>
						<DoneIcon color="secondary" />
						<Typography color="secondary">
							{t('invitations.text-status-sent')}
						</Typography>
					</div>
				);
			}
			// Yet not sending the invitation.
			return null;
		}
	}
}

export default Invitation;
