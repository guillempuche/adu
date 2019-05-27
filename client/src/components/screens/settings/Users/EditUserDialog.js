import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../../../actions';
import { reduxForm, getFormInitialValues } from 'redux-form';
import { withNamespaces } from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import EditUserNameField from './EditUserNameField';
import EditUserEmailsField from './EditUserEmailsField';
import EditUserRoleField from './EditUserRoleField';

/**
 * @class Dialog to edit a user personal information by using the Redux Form.
 */
class EditUser extends Component {
    constructor(props) {
        super(props);

        this.handleCancel = this.handleCancel.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    /**
     * We initialize the default value for the fields: `name`, `account`
     * email and `role`. Only we'll do it if dialog change from unshown to shown..
     *
     * @param {Object} prevProps - The previous props.
     */
    componentDidUpdate(prevProps) {
        const { show, user, initialize } = this.props;

        if (prevProps.show === false && show === true) {
            const { displayName } = user.personalInfo.name;
            const { account } = user.personalInfo.emails;
            const { role } = user;
            var initialValues = {};

            if (displayName) _.merge(initialValues, { name: displayName });
            if (account) _.merge(initialValues, { email: account });
            if (role) _.merge(initialValues, { role });

            initialize(initialValues);
        }
    }

    componentWillMount() {
        this.props.deleteSelectedUser();
    }

    handleCancel = () => {
        /**
         * @typedef {function} onClose - Close the dialog. Prop passed by
         * parent component.
         */
        this.props.onClose();
    };

    handleSave = ({ name, email, role }) => {
        /**
         * @typedef {Object} user - User that we are editing.
         * @typedef {Object} initialValues - Initia values of fields
         * from the Redux Form.
         * @typedef {function} editUser - Action Creator to save data
         * to the database.
         * @typedef {function} onClose - Close the dialog. This prop call
         * the parent component.
         */
        const { user, initialValues, editUser, onClose } = this.props;

        // Only save the values that aren't empty and that have changed.
        const formValues = {
            name: name && initialValues.name !== name ? name : null,
            email: email && initialValues.email !== email ? email : null,
            role: role && initialValues.role !== role ? role : null
        };

        // Send values to save on the database.
        editUser(user._id, formValues);

        // Close the dialog.
        onClose();
    };

    render() {
        /**
         * @typedef {boolean} show - Say to dialog to show.
         *
         * Redux Form passed these props:
         * @typedef {function} handleSubmit - It will run validation, both
         * sync and async, and, if the form is `valid`, it will call
         * `this.props.onSubmit(data)` with the contents of the form data.
         * @typedef {boolean} invalid - `true` if the form's fields are valid.
         * @typedef {boolean} pristine - `true` if the current value is
         * the same as the initialized value, `false` otherwise.
         * @typedef {boolean} submitting - It will only work if you have
         * passed an `onSubmit` function that returns a promise. It will
         * be `true` until the promise is resolved or rejected.
         */
        const {
            show,
            onClose,
            handleSubmit,
            invalid,
            pristine,
            submitting,
            t
        } = this.props;

        return (
            <Dialog
                open={show}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    {t('dialog-edit.title')}
                </DialogTitle>
                <DialogContent>
                    <form>
                        <EditUserNameField />
                        <EditUserEmailsField />
                        <EditUserRoleField />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Tooltip title={t('dialog-edit.button-tooltip-cancel')}>
                        <Button color="secondary" onClick={this.handleCancel}>
                            {t('dialog-edit.button-cancel')}
                        </Button>
                    </Tooltip>
                    <Tooltip title={t('dialog-edit.button-tooltip-save')}>
                        {/** Div Tag added to delete a Material UI warning when Button Submit is disabled. */}
                        <div>
                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                disabled={pristine || invalid || submitting}
                                onClick={
                                    // `handleSubmit` has to be in a button tag.
                                    handleSubmit(formValues => {
                                        this.handleSave(formValues);
                                    })
                                }
                            >
                                {t('dialog-edit.button-save')}
                            </Button>
                        </div>
                    </Tooltip>
                </DialogActions>
            </Dialog>
        );
    }
}

/**
 * Validation that we pass to Redux Form.
 * @param {string} name - Name field from the User Form.
 * @param {string} email - Email field from the User Form.
 */
const validate = ({ name, email }, { t }) => {
    /**
     * @typedef {Object} errors={} - Create an error for the field
     * of the form. It's important that by default it's `undefined`.
     */
    const errors = {};

    // Regex code.
    const re1 = /[\s]$/;
    const re2 = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Regex code 're1' says if it only contains
    // whitespaces will produces and error.
    if (!name || re1.test(name)) errors.name = t('form-validation.name');

    if (email && !re2.test(email))
        errors.email = t('common:form.validation-email');

    return errors;
};

function mapStateToProps(state) {
    return {
        user: state.user.selectedUser,
        initialValues: getFormInitialValues('userForm')(state)
    };
}

EditUser.propTypes = {
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
};

const enhancer = compose(
    // It has to be before Redux Form, else the 't' function won't
    // work on 'validate' function.
    withNamespaces(
        // Default namespace
        'settingsUsersTable',
        // Secondary namespace
        'common'
    ),
    reduxForm({
        form: 'userForm',
        validate
    }),
    connect(
        mapStateToProps,
        actions
    )
);

export default enhancer(EditUser);
