import axios from 'axios';
import React, { useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import { Redirect, withRouter } from 'react-router';
import { reduxForm, Field } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import InputIcon from '@material-ui/icons/Input';

import ROUTES from '../../utils/routes';
import { useAuth0 } from './login/auth0-wrapper';

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

/**
 * @typedef {function} handleSubmit - It will run validation, both
 * sync and async, and, if the form is `valid`, it will call
 */
const Onboarding = ({ auth, handleSubmit, t, classes }) => {
    const { logout, getTokenSilently, getTokenWithPopup, user } = useAuth0();

    console.log('user', user);

    const [redirectToApp, setRedirectToApp] = useState(false);
    const [accessAllowed, setAccessAllowed] = useState(false);

    /**
     * Get Access Token using Auth0.
     *
     * Use getTokenSilently when we don't use localhost, else use getTokenWithPopup (this will show the user consent).
     * More about:
     * - https://auth0.com/docs/libraries/auth0-spa-js#get-access-token-with-no-interaction
     * - https://auth0.com/docs/api-auth/user-consent#skipping-consent-for-first-party-applications
     * @async
     * @return {Promise<string>} Access Token.
     */
    const getAccessToken = async () => {
        const params = {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE_USER_API,
            redirect_uri: process.env.REACT_APP_AUTH0_REDIRECT_URI
        };
        return window.location.hostname === 'localhost'
            ? await getTokenWithPopup(params)
            : await getTokenSilently(params);
    };

    // /**
    //  * Send faculty id (already verified) to be created to the actual
    //  * user database, then redirect user to the rest of the app.
    //  *
    //  * @param {string} id - Faculty's id.
    //  */
    // const handleFacultyIdSubmit = async id => {
    //     var userUpdated;

    //     try {
    //         userUpdated = await axios.post(
    //             `/api/users/${props.auth._id}/faculties/${id}`
    //         );

    //         // Set state te be redirected to the rest of the app.
    //         if (userUpdated.data === true) {
    //             // setState(() => ({
    //             //     redirectToApp: true
    //             // }));
    //             setRedirectToApp(false);

    //             // // Update the user with the new information about the faculty.
    //             // props.fetchUser();
    //         }
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };

    // const renderField = ({
    //     label,
    //     input,
    //     meta: { touched, error, invalid },
    //     ...custom
    // }) => {
    //     // const { t, classes } = props;

    //     return (
    //         <TextField
    //             label={label} // Title
    //             placeholder={t('form.placeholder')} // Background text
    //             required
    //             error={touched && invalid}
    //             helperText={touched && (error || t('form.validation-valid'))}
    //             variant="outlined"
    //             margin="normal"
    //             className={classes.textField}
    //             {...custom}
    //             {...input}
    //         />
    //     );
    // };
    /**
     * Send faculty id (already verified) to be created to the actual
     * user database, then redirect user to the rest of the app.
     *
     * @param {string} email Email.
     */
    const handleEmailSubmit = async email => {
        try {
            const accessToken = await getAccessToken();
            const { sub } = user;
            const response = await axios.post(
                `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/jobs/verification-email`,
                {
                    user_id: sub,
                    client_id: process.env.REACT_APP_AUTH0_CLIENT_ID
                },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            console.log('Email sent', response.data);
            // // Set state te be redirected to the rest of the app.
            // if (userUpdated.data === true) {
            //     // setState(() => ({
            //     //     redirectToApp: true
            //     // }));
            //     setRedirectToApp(false);

            //     // // Update the user with the new information about the faculty.
            //     // props.fetchUser();
            // }
        } catch (err) {
            console.error(err);
        }
    };

    const renderField = ({
        label,
        input,
        meta: { touched, error, invalid },
        ...custom
    }) => {
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
    };

    /**
     * If user has at least 1 faculty linked to him, then he's redirected
     * to the app.
     *
     * 2 ways he's redirected:
     * - User is already linked before the component is mounted
     * - User submit the code (Faculty's id) to save to database, then he can be
     * redirected to the rest of the app.
     */
    if (auth._faculties.length > 0 || redirectToApp === true) {
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
                        <div>
                            <Button
                                variant="contained"
                                onClick={async () => {
                                    try {
                                        const accessToken = await getAccessToken();
                                        const { status } = await axios.get(
                                            `${process.env.REACT_APP_API_DOMAIN}/private`,
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${accessToken}`
                                                }
                                            }
                                        );
                                        status === 200
                                            ? setAccessAllowed(true)
                                            : setAccessAllowed(false);
                                    } catch (err) {
                                        setAccessAllowed(false);
                                    }
                                }}
                            >
                                Private Call for All
                            </Button>
                            <Button
                                variant="contained"
                                onClick={async () => {
                                    try {
                                        const accessToken = await getAccessToken();
                                        const { status } = await axios.get(
                                            `${process.env.REACT_APP_API_DOMAIN}/privateAdmins`,
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${accessToken}`
                                                }
                                            }
                                        );
                                        status === 200
                                            ? setAccessAllowed(true)
                                            : setAccessAllowed(false);
                                    } catch (err) {
                                        setAccessAllowed(false);
                                    }
                                }}
                            >
                                Private Call for Faculty Admins
                            </Button>
                            {accessAllowed ? ' ALLOWED ' : ' DENIED '}
                        </div>
                        <div>
                            {/* <form>
                            <Field
                                name="code" // Redux Form field's id
                                type="text"
                                label={t('form.textfield')}
                                component={renderField}
                            />
                        </form>
                        <Button
                            variant="contained"
                            size="large"
                            color="secondary"
                            className={classes.button}
                            onClick={handleSubmit(formValue => {
                                handleFacultyIdSubmit(formValue.code);
                            })}
                        >
                            {t('button.login')}
                            <InputIcon className={classes.iconButton} />
                        </Button> */}
                            <form>
                                <Field
                                    name="email" // Redux Form field's id
                                    type="email"
                                    label={t('form.textfield')}
                                    component={renderField}
                                />
                            </form>
                            <Button
                                variant="contained"
                                size="large"
                                color="secondary"
                                className={classes.button}
                                onClick={handleSubmit(formValue => {
                                    handleEmailSubmit(formValue.email);
                                })}
                            >
                                {t('button.login')}
                                <InputIcon className={classes.iconButton} />
                            </Button>
                        </div>
                        <a
                            onClick={() =>
                                logout({
                                    returnTo: 'http://localhost:3000'
                                })
                            }
                        >
                            <Typography variant="caption">
                                {t('text.logout')}
                            </Typography>
                        </a>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

/**
 * Validation that we pass to Redux Form.
 * @param {string} code Faculty's id.
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
        var id = await axios.get(`/api/faculties/${code}`);
    } catch (err) {
        console.log(err);
    }

    if (id.data === false) throw { code: t('form.validation-async') };
};

const mapStateToProps = ({ auth }) => {
    return { auth: { _id: '11111', _faculties: [] } };
};

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withRouter,
    // It has to be called before Redux Form to be able to
    // use t function on validate().
    withTranslation('login'),
    reduxForm({
        form: 'onboardingForm'
        // validate,
        // asyncValidate
    }),
    withStyles(styles)
);

export default enhancer(Onboarding);
