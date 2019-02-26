import React, { Component, Fragment } from 'react';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import { Link } from 'react-router-dom';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import Tooltip from '@material-ui/core/Tooltip';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TextFieldsIcon from '@material-ui/icons/TextFields';

import ChatAppBarMenu from './ChatAppBarMenu';
import { ROUTES } from '../utils/routes';

const styles = theme => ({
    grow: {
        flexGrow: 1
    },
    link: {
        textDecoration: 'none',
        color: theme.palette.primary.contrastText
    },
    linkButton: {
        color: theme.palette.primary.contrastText
    }
});

/**
 * Chats navigation bar component. It renders itself according to screen width.
 *
 * Main custom components used:
 *  - `ChatAppBarMenu`: menu.
 *  - `MoreIcon`: open the menu.
 */
class ChatAppBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            settingsAnchorEl: null
        };

        this.handleSettingsMenuOpen = this.handleSettingsMenuOpen.bind(this);
        this.handleSettingsMenuClose = this.handleSettingsMenuClose.bind(this);
    }

    /**
     * Open the menu.
     * @param {object} event
     */
    handleSettingsMenuOpen(event) {
        this.setState({
            settingsAnchorEl: event.currentTarget
        });
    }

    /**
     * Close the menu.
     */
    handleSettingsMenuClose() {
        this.setState({ settingsAnchorEl: null });
    }

    render() {
        const { settingsAnchorEl } = this.state;
        const { classes, t } = this.props;

        const renderAppBarRightIcons = (
            <Fragment>
                <Tooltip title={t('tooltip.icon-settings')}>
                    <IconButton
                        color="inherit"
                        onClick={this.handleSettingsMenuOpen}
                    >
                        <AccountCircleIcon />
                    </IconButton>
                </Tooltip>
                <Link to={ROUTES.database.path} className={classes.linkButton}>
                    <Tooltip title={t('tooltip.icon-database')}>
                        <IconButton color="inherit">
                            <TextFieldsIcon />
                        </IconButton>
                    </Tooltip>
                </Link>
            </Fragment>
        );

        // I hasn't created an external component for this menu because I would has to pass props for click events...
        const renderSettingsMenu = (
            <Menu
                // anchorEl: has to be a DOM element (object or function), eg: <button ...> or null.
                anchorEl={settingsAnchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                open={Boolean(settingsAnchorEl)}
                onClose={this.handleSettingsMenuClose}
            >
                <ChatAppBarMenu />
            </Menu>
        );

        return (
            <div>
                <Toolbar>
                    <Link to={ROUTES.app.path} className={classes.link}>
                        <Typography variant="h6" color="inherit" noWrap>
                            Au
                        </Typography>
                    </Link>
                    <div className={classes.grow} />
                    {renderAppBarRightIcons}
                    {renderSettingsMenu}
                </Toolbar>
            </div>
        );
    }
}

const enhance = compose(
    withStyles(styles),
    withNamespaces(['chatAppBar', 'common'])
);

export default enhance(ChatAppBar);
