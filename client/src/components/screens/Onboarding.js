import axios from 'axios';
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import { Redirect, withRouter } from 'react-router';
import { reduxForm, Field } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
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
    },
    textField: {
        [theme.breakpoints.up('sm')]: {
            width: '320px'
        },
        [theme.breakpoints.down('xs')]: {
            width: '100%'
        }
    }
});

class Onboarding extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirectToApp: false
        };

        this.handleFacultyIdSubmit = this.handleFacultyIdSubmit.bind(this);
        this.renderField = this.renderField.bind(this);
    }

    /**
     * Send faculty id (already verified) to be created to the actual
     * user database, then redirect user to the rest of the app.
     *
     * @param {string} code - Faculty's id.
     */
    async handleFacultyIdSubmit(code) {
        var userUpdated;

        try {
            userUpdated = await axios.post('/api/users/editFaculty', code);

            // Set state te be redirected to the rest of the app.
            if (userUpdated.data === true) {
                this.setState(() => ({
                    redirectToApp: true
                }));
                //this.props.history.push(ROUTES.app.path);
                this.props.fetchUser();
            }
        } catch (err) {
            console.log(err);
        }
    }

    renderField({
        label,
        input,
        meta: { touched, error, invalid },
        ...custom
    }) {
        const { t, classes } = this.props;

        return (
            <TextField
                label={label} // Title
                placeholder={t('form.placeholder')} // Background text
                required
                error={touched && invalid}
                helperText={touched && (error || t('form.validation-valid'))}
                variant="outlined"
                margin="normal"
                className={classes.textField}
                {...custom}
                {...input}
            />
        );
    }

    render() {
        /**
         * @typedef {function} handleSubmit - It will run validation, both
         * sync and async, and, if the form is `valid`, it will call
         */
        const { auth, handleSubmit, t, classes } = this.props;
        const { redirectToApp } = this.state;

        /**
         * If user has at least 1 faculty linked to him, then he's redirected.
         *
         * 2 ways:
         * - User is already linked before the component is mounted
         * - User submit the code (Faculty's id) to save to database, then he can be
         * redirected to the rest of the app.
         */
        if (auth._faculties.length > 0 || redirectToApp === true) {
            // this.props.history.push(ROUTES.app.path);
            return <Redirect to={ROUTES.app.path} />;
        }

        return (
            <div className={classes.root}>
                <Grid container>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <Typography variant="body1" align="left">
                                {t('text.onboarding')}
                            </Typography>
                            <form>
                                <Field
                                    name="code" // Redux Form field's id
                                    type="text"
                                    label={t('form.textfield')}
                                    component={this.renderField}
                                />
                            </form>
                            <Button
                                variant="contained"
                                size="large"
                                color="secondary"
                                className={classes.button}
                                onClick={handleSubmit(code => {
                                    this.handleFacultyIdSubmit(code);
                                })}
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
}

/**
 * Validation that we pass to Redux Form.
 * @param {string} code - Faculty's id.
 */
const validate = ({ code }, { t }) => {
    const errors = {};

    // Regex code.
    const re = /[\s]$/; // Whitespaces

    // Regex code says if it only contains
    // whitespaces will produces and error.
    if (!code || re.test(code)) errors.code = t('form.validation-sync');

    return errors;
};

/**
 * Validation that we pass to Redux Form.
 * @param {Array} args[0].code - Faculty's id.
 * @param {Array} args[1] - Props of the component.
 */
const asyncValidate = async (...args) => {
    const { code } = args[0];
    const { t } = args[2];
    try {
        var id = await axios.get(`/api/faculties/checkId?id=${code}`);
    } catch (err) {
        console.log(err);
    }

    if (id.data === false) throw { code: t('form.validation-async') };
};

function mapStateToProps({ auth }) {
    return { auth };
}

const enhance = compose(
    withNamespaces('login'),
    withStyles(styles),
    connect(
        mapStateToProps,
        actions
    ),
    withRouter,
    reduxForm({
        form: 'onboardingForm',
        validate,
        asyncValidate
    })
);

export default enhance(Onboarding);
