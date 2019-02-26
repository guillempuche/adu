import React from 'react';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import Grid from '@material-ui/core/Grid';

import Invitation from './Invitation';
import UsersTable from './Users/UsersTable';

const styles = theme => ({
    root: {}
});

function Settings({}) {
    return (
        <Grid container>
            <Grid item xs={12}>
                <Invitation />
            </Grid>
            <Grid item xs={12}>
                <UsersTable />
            </Grid>
        </Grid>
    );
}

const enhance = compose(
    withNamespaces('settings'),
    withStyles(styles)
);

export default enhance(Settings);
