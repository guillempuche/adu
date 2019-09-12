import _ from 'lodash';
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import { withNamespaces } from 'react-i18next';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import green from '@material-ui/core/colors/green';

const styles = theme => ({
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
 * @class Alert the user/client about a general error on the app.
 */
class Error extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            show: false
        };

        this.handleClose = this.handleClose.bind(this);
    }

    /**
     * If there's a change on status state,  we alert the user showing the snack bar.
     */
    componentDidUpdate(prevProps, prevState) {
        const { generalError } = this.props;

        // Initial state of Snackbar component. Status has to be the same
        // value than the CSS style.
        let title = '',
            show = false;

        if (prevProps.generalError !== generalError) {
            title = generalError;
            show = true;
        }

        // We don't want to change `state` everytime when `componentDidUpdate`
        // is executed, only when previous `show` was `false` and `show` is `true`.
        if (prevState.show === false && show) {
            this.setState({
                title,
                show
            });
        }
    }

    /**
     * Close the snack bar.
     */
    handleClose() {
        this.setState({ title: '', show: false });
    }

    render() {
        const { classes } = this.props;
        const { title, show } = this.state;

        if (show) {
            return (
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                    }}
                    open={show}
                    autoHideDuration={4000} // 4 seconds.
                    onClose={this.handleClose}
                >
                    <SnackbarContent
                        className={classes.warningColor}
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

function mapStateToProps({ error }) {
    const { generalError } = error;
    return {
        generalError
    };
}

const enhancer = compose(
    connect(mapStateToProps),
    withStyles(styles)
    // withNamespaces('')
);
export default enhancer(Error);
