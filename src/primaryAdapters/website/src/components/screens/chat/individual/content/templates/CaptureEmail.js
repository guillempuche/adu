import _ from 'lodash';
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core';
import { reduxForm, Field } from 'redux-form';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import * as actions from '../../../../../../actions';
import { isClientURL } from '../../../../../../utils/utils';

const styles = theme => ({
    captureEmail: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    form: {
        margin: '10px 0px'
    },
    button: theme.chat.message.button
});

/**
 * @class Get the email of client.
 */
class CaptureEmail extends Component {
    constructor(props) {
        super(props);

        this.renderField = this.renderField.bind(this);
    }

    componentDidMount() {
        const { initialize, email } = this.props;
        initialize({ email });
    }

    renderField({
        input,
        label,
        meta: { touched, error, invalid },
        ...custom
    }) {
        const { t, classes } = this.props;

        return (
            <TextField
                label={label} // Title
                placeholder={t('common:form.placeholder-email')} // Background text
                // It's only available for clients.
                disabled={isClientURL() === false}
                error={invalid}
                helperText={touched && error}
                variant="outlined"
                margin="dense"
                className={classes.textField}
                {...input}
                {...custom}
            />
        );
    }
    render() {
        const {
            email,
            pristine,
            invalid,
            submitSucceeded,
            handleSubmit,
            setClientAttributes,
            classes,
            t
        } = this.props;

        return (
            <div className={classes.captureEmail}>
                <Typography variant="body1">
                    {email
                        ? t('content.template-email-edit')
                        : t('content.template-email-new')}
                </Typography>
                <form className={classes.form}>
                    <Field
                        name="email" // Redux Form field's id
                        label={t('common:form.label-email')}
                        type="email"
                        component={this.renderField}
                    />
                </form>
                {submitSucceeded ? (
                    <Typography
                        variant="caption"
                        color="secondary"
                        paragraph={true}
                    >
                        {t('content.template-email-caption')}
                    </Typography>
                ) : null}
                <Button
                    type="submit"
                    variant="outlined"
                    size="small"
                    color="secondary"
                    disabled={pristine || invalid}
                    onClick={
                        // `handleSubmit` has to be in a button tag.
                        handleSubmit(async formValues => {
                            // Removes whitespaces from both sides of the string.
                            formValues.email = formValues.email.trim();

                            await setClientAttributes({
                                email: formValues.email
                            });
                        })
                    }
                    className={classes.button}
                >
                    {t('content.template-email-button')}
                </Button>
            </div>
        );
    }
}

/**
 * Validation that we pass to Redux Form.
 * @param {string} email Email field from the User Form.
 */
function validate({ email }, { t }) {
    /**
     * @typedef {Object} errors={} - Create an error for the field
     * of the form. It's important that by default it's `undefined`.
     */
    const errors = {};

    // Regex code.
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Removes whitespace from both sides of the string.
    if (email && !re.test(email.trim()))
        errors.email = t('common:form.validation-email');

    return errors;
}

function mapStateToProps({ client }) {
    // FOR OLDER DATABASE: If the client hasn't yet some attributes,
    // we don't follow because it'll produce an error: 'email is undefined'.
    if (client.attributes) {
        const { email } = client.attributes;
        return { email };
    }

    return {};
}

const enhancer = compose(
    // It has to be before Redux Form, else the 't' function won't
    // work on 'validate' function.
    withTranslation(['chatClient', 'common']),
    reduxForm({
        form: 'chatCaptureEmailForm',
        validate
    }),
    connect(
        mapStateToProps,
        actions
    ),
    withStyles(styles)
);

export default enhancer(CaptureEmail);
