import _ from 'lodash';
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import InputIcon from '@material-ui/icons/Input';

import ROUTES from '../../../utils/routes';

const styles = theme => ({
    root: {
        flexGrow: 1
    },
    paper: {
        alignItems: 'center',
        alignContent: 'center',
        textAlign: 'center',
        margin: theme.spacing(6),
        padding: theme.spacing(5)
    },
    button: {
        margin: theme.spacing(2)
    },
    iconButton: {
        marginLeft: theme.spacing(2)
    }
});

function SignupAndLogin({ auth, t, classes }) {
    // If the user is already authenticated, redirect to the dashboard.
    if (_.isEmpty(auth) === false) return <Redirect to={ROUTES.app.path} />;
    else
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

function mapStateToProps({ auth }) {
    return { auth };
}

const enhancer = compose(
    connect(mapStateToProps),
    withNamespaces('login'),
    withStyles(styles)
);

export default enhancer(SignupAndLogin);
