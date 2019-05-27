import classNames from 'classnames';
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';

import * as actions from '../../../../actions';

const styles = theme => ({
    appBarTheme: theme.components.appBar.shadow,
    appBarMargins: theme.components.appBar.sideMargins,
    appBarNavigationIcon: theme.components.appBar.navigationIcon,
    title: {
        flexGrow: 1
    }
});

class Profile extends Component {
    constructor(props) {
        super(props);

        this.renderDetails = this.renderDetails.bind(this);
        this.renderDialog = this.renderDialog.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    renderDetails() {
        return <div>Profile</div>;
    }

    renderDialog() {
        const { profileDialog, classes } = this.props;

        return (
            <Dialog fullScreen open={profileDialog} onClose={this.handleClose}>
                <AppBar
                    position="static"
                    className={classNames(
                        classes.appBarTheme,
                        classes.appBarMargins
                    )}
                >
                    <Toolbar disableGutters>
                        <IconButton
                            color="inherit"
                            onClick={this.handleClose}
                            className={classes.appBarNavigationIcon}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography
                            variant="h6"
                            color="inherit"
                            className={classes.title}
                        >
                            Profile
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div>{this.renderDetails()}</div>
            </Dialog>
        );
    }

    handleClose() {
        this.props.handleComponentProfileDialog();
    }

    render() {
        const { width } = this.props;
        if (width !== 'xs' && width !== 'sm') return this.renderDetails();
        else {
            return this.renderDialog();
        }
    }
}

function mapStateToProps({ components }) {
    const { profileDialog } = components.chat;
    return { profileDialog };
}

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withStyles(styles),
    withWidth()
);

export default enhancer(Profile);
