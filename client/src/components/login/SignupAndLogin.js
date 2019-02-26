import React from 'react';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import InputIcon from '@material-ui/icons/Input';

import { ROUTES } from '../utils/routes';

const styles = theme => ({
    root: {
        flexGrow: 1
    },
    paper: {
        alignItems: 'center',
        alignContent: 'center',
        textAlign: 'center',
        margin: theme.spacing.unit * 6,
        padding: theme.spacing.unit * 5
    },
    button: {
        margin: theme.spacing.unit * 2
    },
    iconButton: {
        marginLeft: theme.spacing.unit * 2
    }
});

function SignupAndLogin({ t, classes }) {
    return (
        <div className={classes.root}>
            <Grid container>
                <Grid item xs={12}>
                    <Paper className={classes.paper}>
                        <Typography variant="body1">
                            {t('text.login')}
                        </Typography>
                        <Button
                            href={ROUTES.auth.path}
                            variant="contained"
                            size="large"
                            color="secondary"
                            className={classes.button}
                        >
                            {t('button.login')}
                            <InputIcon className={classes.iconButton} />
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

const enhance = compose(
    withStyles(styles),
    withNamespaces('login')
);

export default enhance(SignupAndLogin);
