import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { compose } from 'redux';
import { reduxForm, Field } from 'redux-form';
import { withNamespaces } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    textField: {
        width: '100%'
    }
});

/**
 * Render a the name field of the form.
 *
 * Redux Form's Field component passes values by default to this compoent.
 */
class EditUserNameField extends Component {
    constructor(props) {
        super(props);

        this.renderField = this.renderField.bind(this);
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
                placeholder={t('dialog-edit.textfield-placeholder-name')} // Background text
                required
                error={touched && invalid}
                helperText={error}
                variant="outlined"
                margin="normal"
                className={classes.textField}
                {...custom}
                {...input}
            />
        );
    }

    render() {
        const { t } = this.props;

        return (
            <Fragment>
                <Field
                    name="name" // Redux Form field's id
                    label={t('dialog-edit.textfield-name')}
                    type="text"
                    component={this.renderField}
                />
            </Fragment>
        );
    }
}

const enhance = compose(
    withNamespaces('settingsUsersTable'),
    withStyles(styles),
    reduxForm({
        form: 'userForm'
    })
);

export default enhance(EditUserNameField);
