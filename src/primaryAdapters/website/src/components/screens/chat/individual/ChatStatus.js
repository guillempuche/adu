import _ from 'lodash';
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import green from '@material-ui/core/colors/green';

const styles = theme => ({
    successColor: {
        backgroundColor: green['A400'],
        color: theme.typography.body2.color
    },
    warningColor: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText
    },
    message: {
        display: 'flex',
        alignItems: 'center'
    },
    icon: {
        marginRight: theme.spacing(2)
    }
});

/**
 * Alert the user/client about errors or warnings from chat, network...
 */
class ChatStatus extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            show: false,
            icon: 'NotificationImportantIcon',
            status: 'success' // 'success' or 'warning'
        };

        this.handleClose = this.handleClose.bind(this);
    }

    /**
     * If there's a change on status state, we alert the user showing the snack bar.
     */
    componentDidUpdate(prevProps, prevState) {
        const {
            chatMainStatus,
            clientErrorSetAttributes,
            chatErrorGeneral,
            chatErrorMessageNotSavedToDatabase,
            t
        } = this.props;

        // Initial state of Snackbar component. Status has to be the same value than the CSS style.
        let title = '',
            show = false,
            status = 'warning';

        // ===================================
        //          MAIN CHAT STATUS
        // ===================================
        if (prevProps.chatMainStatus !== chatMainStatus) {
            // Some of thsese issues are from PubNub: https://www.pubnub.com/docs/web-javascript/pubnub-network-lifecycle and https://www.pubnub.com/docs/web-javascript/status-events
            switch (chatMainStatus) {
                case 'PNNetworkUpCategory':
                    // setState('Online');
                    title = t('status.online');
                    show = true;
                    status = 'success';
                    break;
                case 'PNNetworkDownCategory':
                    title = t('status.offline');
                    title = 'Offline';
                    show = true;
                    break;
                case 'PNTLSConnectionFailedCategory':
                    title = t('status.poor-connection');
                    show = true;
                    break;
                default:
                    break;
            }
        }

        // ========================================================
        //          CHAT STATUS CHAT GENERAL ERROR
        // ========================================================
        if (prevProps.chatErrorGeneral !== chatErrorGeneral) {
            title = chatErrorGeneral;
            show = true;
        }

        // ========================================================
        //          CHAT STATUS MESSAGE NOT SAVED ON THE DATABASE
        // ========================================================
        if (
            prevProps.chatErrorMessageNotSavedToDatabase !==
                chatErrorMessageNotSavedToDatabase &&
            _.isEmpty(chatErrorMessageNotSavedToDatabase) === false
        ) {
            title = t('status.error-save-message');
            show = true;
        }

        // ========================================================
        //          CLIENT STATUS ATTRIBUTE NOT SET CORRECTLY
        // ========================================================
        if (
            clientErrorSetAttributes !== null &&
            prevProps.clientErrorSetAttributes !== clientErrorSetAttributes
        ) {
            if (clientErrorSetAttributes === 'email')
                title = t('status.error-client-attribute-email');
            show = true;
        }

        // We don't want to change `state` everytime when `componentDidUpdate` is executed, only when previous `show` was `false` and `show` is `true`.
        if (prevState.show === false && show) {
            this.setState({
                title,
                show,
                status
            });
        }
    }

    // Close the snack bar.
    handleClose() {
        this.setState({ title: '', show: false });
    }

    render() {
        const { classes } = this.props;
        const { title, show, status } = this.state;

        const variantColor = `${status}Color`;
        if (show) {
            return (
                <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                    open={show}
                    autoHideDuration={4000} // 4 seconds.
                    onClose={this.handleClose}
                >
                    <SnackbarContent
                        className={
                            // More about dynamic colors/icons: https://material-ui.com/demos/snackbars/#snackbars
                            classes[variantColor]
                        }
                        message={
                            <span id="message-id" className={classes.message}>
                                <NotificationImportantIcon
                                    className={classes.icon}
                                />
                                {title}
                            </span>
                        }
                    />
                </Snackbar>
            );
        } else return null;
    }
}

function mapStateToProps({ status, error }) {
    const { chatMainStatus } = status.chatStatus;
    const { clientError, chatError } = error;
    const { clientErrorSetAttributes } = clientError;
    const { chatErrorGeneral, chatErrorMessageNotSavedToDatabase } = chatError;
    return {
        chatMainStatus,
        clientErrorSetAttributes,
        chatErrorGeneral,
        chatErrorMessageNotSavedToDatabase
    };
}

const enhancer = compose(
    connect(mapStateToProps),
    withStyles(styles),
    withTranslation('chatClient')
);
export default enhancer(ChatStatus);
