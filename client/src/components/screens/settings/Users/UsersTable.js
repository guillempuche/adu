import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../../../../actions';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';

import EditUserDialog from './EditUserDialog';

const styles = theme => ({
    settings: {
        margin: theme.spacing(),
        overflowX: 'auto'
    },
    editTableRow: {
        paddingTop: '4px',
        paddingRight: '0px',
        paddingBottom: '4px',
        paddingLeft: '10px'
    }
});

/**
 * @class Table that shows all users according to the user's permissions:
 * - If user is `superadmin`, we will show all users from all `universities`.
 * - If user is `admin`, we will show all users from his `faculty`.
 *
 * @method renderTableRow - Render a full of row with one user on each row.
 * @method handleOnOpenDialog - Show or hide the dialog for edit a user from the table.
 */
class UsersTable extends Component {
    constructor(props) {
        super(props);
        this.state = { toggleEditUserDialog: false };

        this.renderTableRow = this.renderTableRow.bind(this);
        this.renderEmails = this.renderEmails.bind(this);
        this.handleOnOpenDialog = this.handleOnOpenDialog.bind(this);
        this.handleOnCloseDialog = this.handleOnCloseDialog.bind(this);
    }

    componentDidMount() {
        this.props.fetchAllUsers();
    }

    handleOnOpenDialog(user) {
        // Save the user selected into the global state.
        this.props.selectedUser(user);

        this.setState(state => ({
            toggleEditUserDialog: !state.toggleEditUserDialog
        }));
    }

    handleOnCloseDialog() {
        this.setState(state => ({
            toggleEditUserDialog: !state.toggleEditUserDialog
        }));
    }

    /**
     * Populate every cell of the row with user's data.
     *
     * When we want to edit the row, we click the button to open a
     * `Dialog` (with `handleOnOpenDialog`).
     *
     * @return {Array} Array of DOM element for each table row.
     */
    renderTableRow() {
        const { auth, users, t, classes } = this.props;
        const unknown = t('table-body.cell-unknown');

        if (users === []) {
            return null;
        } else {
            return users.map(user => {
                const { personalInfo, role, _faculties } = user;

                return (
                    <TableRow key={user._id}>
                        <TableCell
                            component="th"
                            scope="row"
                            className={classes.editTableRow}
                        >
                            <Tooltip title={t('button.tooltip-edit')}>
                                <IconButton
                                    color="secondary"
                                    onClick={() =>
                                        this.handleOnOpenDialog(user)
                                    }
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                        <TableCell>{personalInfo.name.displayName}</TableCell>
                        <TableCell>
                            {// Convert an array of objects to a comma-seperated list
                            this.renderEmails(personalInfo.emails)}
                        </TableCell>
                        <TableCell>{role}</TableCell>
                        {auth.userType.superadmin ? (
                            <TableCell>
                                {_faculties.length !== 0
                                    ? _faculties[0].name
                                    : unknown}
                            </TableCell>
                        ) : null}
                    </TableRow>
                );
            });
        }
    }

    /**
     * Return a string of all `emails` seperated with a comma.
     *
     * @param {Object} emails - Object of default email and others emails.
     * @param {String} emails.auth - An email.
     * @param {String} emails.account - An email.
     * @param {Array} emails.others - Array of string of emails.
     */
    renderEmails(emails) {
        const { auth, account, others } = emails;
        const othersEmails = others.length
            ? ', ' +
              Object.keys(others)
                  .map(function(k) {
                      return others[k];
                  })
                  .join(', ')
            : '';

        // Retunr all emails joint.
        return (account ? `${account}, ` : '') + auth + othersEmails;
    }

    render() {
        const { toggleEditUserDialog } = this.state;
        const { auth, t, classes } = this.props;

        return (
            <Paper className={classes.settings}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.editTableRow} />
                            <TableCell>
                                {t('table-header-column.name')}
                            </TableCell>
                            <TableCell>
                                {t('table-header-column.emails')}
                            </TableCell>
                            <TableCell>
                                {t('table-header-column.role')}
                            </TableCell>
                            {auth.userType.superadmin ? (
                                <TableCell>
                                    {t('table-header-column.faculties')}
                                </TableCell>
                            ) : null}
                        </TableRow>
                    </TableHead>
                    <TableBody>{this.renderTableRow()}</TableBody>
                </Table>
                <EditUserDialog
                    show={toggleEditUserDialog}
                    onClose={this.handleOnCloseDialog}
                />
            </Paper>
        );
    }
}

function mapStateToProps({ auth, user }) {
    return {
        auth,
        users: user.all
    };
}

UsersTable.propTypes = {
    auth: PropTypes.object.isRequired,
    users: PropTypes.arrayOf(PropTypes.object).isRequired
};

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withNamespaces(['settingsUsersTable']),
    withStyles(styles)
);

export default enhancer(UsersTable);
