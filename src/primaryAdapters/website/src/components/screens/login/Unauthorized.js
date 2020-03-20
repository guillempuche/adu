import React from 'react';

import { useAuth0 } from './auth0-wrapper';
import { useTranslation } from 'react-i18next';

// Style
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
	layout: {
		height: '100vh',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	}
}));

const Unauthorized = () => {
	const { logout } = useAuth0();
	const { t } = useTranslation('unauthorized');
	const classes = useStyles();

	return (
		<div className={classes.layout}>
			<Typography>{t('text')}</Typography>
			<Button
				variant="contained"
				color="secondary"
				onClick={() => logout()}
			>
				{t('buttonLogOut')}
			</Button>
		</div>
	);
};

export default Unauthorized;
