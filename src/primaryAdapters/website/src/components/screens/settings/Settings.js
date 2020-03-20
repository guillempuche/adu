import React from 'react';
import { compose } from 'redux';
import Grid from '@material-ui/core/Grid';

import SendInvitations from './SendInvitations';
import UsersTable from './Users/UsersTable';

function Settings() {
	return (
		<Grid container>
			<Grid item xs={12}>
				<SendInvitations />
			</Grid>
			{/* <Grid item xs={12}>
                <UsersTable />
            </Grid> */}
		</Grid>
	);
}

export default Settings;
