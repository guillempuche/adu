import React, { useEffect } from 'react';
import { useAuth0 } from './auth0-wrapper';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { useTranslation } from 'react-i18next';

// Style
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import { IS_INVITATION_VALID } from '../../../graphql/fetch';

const useStyles = makeStyles(theme => ({
	layout: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100vh',
		...theme.mixins.gutters(),
		margin: theme.spacing()
	},
	loading: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	}
}));

function ValidateInvitation() {
	const { search } = useLocation();
	const { loginWithPopup } = useAuth0();
	const { data, loading, error } = useQuery(IS_INVITATION_VALID, {
		variables: {
			invitation: {
				facultyId: new URLSearchParams(search).get('facultyId') || '',
				code: new URLSearchParams(search).get('number') || '',
				email: new URLSearchParams(search).get('emailRecipient') || ''
			}
		}
	});
	const classes = useStyles();
	const { t } = useTranslation('invitation');

	// useEffect(() => {
	//     if (data && data.isInvitationValid && data.isInvitationValid.success)
	//         loginWithPopup({ display: 'page' });
	// }, [data]);

	return (
		<Paper className={classes.layout}>
			{error || (!loading && !data.isInvitationValid.success) ? (
				<Typography>{t('error')}</Typography>
			) : !loading && data.isInvitationValid.success ? (
				<Button
					variant="contained"
					color="secondary"
					endIcon={<OpenInNewIcon />}
					onClick={() => loginWithPopup()}
				>
					{t('valid')}
				</Button>
			) : (
				<div className={classes.loading}>
					<Typography>{t('loading')}</Typography>
					<CircularProgress color="secondary" />
				</div>
			)}
		</Paper>
	);
}

export default ValidateInvitation;
