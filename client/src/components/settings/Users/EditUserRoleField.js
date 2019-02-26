import React, { Component, Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { withNamespaces } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
    textField: {
        width: '100%'
    }
});

/**
 * Render a the `Role` field of the form.
 *
 * Redux Form's Field component passes values by default to this compoent.
 */
class EditUserRoleField extends Component {
    constructor(props) {
        super(props);

        this.renderField = this.renderField.bind(this);
    }

    renderField({ input, label, ...custom }) {
        const { t, classes } = this.props;

        // IMPORTANT: Tooltip component creates an error when is
        // implemented on a Field (by Redux Form).
        return (
            <Tooltip title={t('dialog-edit.textfield-tooltip-role')}>
                <TextField
                    label={label} // Title
                    placeholder={t('dialog-edit.textfield-placeholder-role')} // Background text
                    variant="outlined"
                    margin="normal"
                    className={classes.textField}
                    {...input}
                    {...custom}
                />
            </Tooltip>
        );
    }

    render() {
        const { t } = this.props;

        //
        return (
            <Fragment>
                <Field
                    name="role" // Redux Form field's id
                    label={t('dialog-edit.textfield-role')}
                    type="text"
                    component={this.renderField}
                />
            </Fragment>
        );
    }
}

const enhance = compose(
    withNamespaces(['settingsUsersTable']),
    withStyles(styles),
    reduxForm({
        form: 'userForm'
    })
);

export default enhance(EditUserRoleField);
