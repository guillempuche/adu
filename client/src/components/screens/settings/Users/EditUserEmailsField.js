import React, { Component, Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { withNamespaces } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
    textField: {
        width: '100%'
    },
    optionalEmail: {
        marginTop: '15px'
    }
});

/**
 * Render the `Email` field of the form.
 *
 * Redux Form's `Field` component passes values (by default)
 * to this compoent.
 */
class EditUserNameField extends Component {
    constructor(props) {
        super(props);

        this.renderField = this.renderField.bind(this);
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
                placeholder={t('dialog-edit.textfield-placeholder-email')} // Background text
                error={invalid}
                helperText={touched && error}
                variant="outlined"
                margin="normal"
                className={classes.textField}
                {...input}
                {...custom}
            />
        );
    }

    render() {
        const { user, t, classes } = this.props;
        const defaultEmail = user.personalInfo.emails.auth;

        return (
            <Fragment>
                <Tooltip
                    title={t('dialog-edit.textfield-tooltip-email-default')}
                >
                    <TextField
                        label={t('dialog-edit.textfield-email-default')} // Title
                        defaultValue={defaultEmail}
                        disabled
                        variant="filled"
                        margin="normal"
                        className={classes.textField}
                    />
                </Tooltip>
                <Typography className={classes.optionalEmail}>
                    {t('dialog-edit.title-email')}
                </Typography>
                <Field
                    name="email" // Redux Form field's id
                    label={t('dialog-edit.textfield-email')}
                    type="email"
                    component={this.renderField}
                />
            </Fragment>
        );
    }
}

function mapStateToProps({ user }) {
    return {
        user: user.selectedUser
    };
}

const enhancer = compose(
    connect(mapStateToProps),
    reduxForm({
        form: 'userForm'
    }),
    withNamespaces(['settingsUsersTable']),
    withStyles(styles)
);

export default enhancer(EditUserNameField);
