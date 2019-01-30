import React, { Component } from 'react';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import { Link } from 'react-router-dom';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import Tooltip from '@material-ui/core/Tooltip';
import NotificationsOffIcons from '@material-ui/icons/NotificationsOff';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TextFieldsIcon from '@material-ui/icons/TextFields';

import ChatAppBarMenu from './ChatAppBarMenu';
import MoreIcon from './MoreIcon';
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
    },
    sectionDesktop: {
        // It enables a flex context for all its direct children.
        display: 'flex',
        // Match [sm, +∞]. When the size is small (sm) or larger (md, lg, xl), then
        // it will be shown. But if it's smaller than 'sm' (sm not included), then it will be hided.
        [theme.breakpoints.down('xs')]: {
            display: 'none'
        }
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('sm')]: {
            display: 'none'
        }
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
            mobileMoreAnchorEl: null
        };
        this.handleMobileMenuOpen = this.handleMobileMenuOpen.bind(this);
        this.handleMobileMenuClose = this.handleMobileMenuClose.bind(this);
    }

    /**
     * Open the menu.
     * @param {object} event
     */
    handleMobileMenuOpen(event) {
        this.setState({
            mobileMoreAnchorEl: event.currentTarget
        });
    }

    /**
     * Close the menu.
     */
    handleMobileMenuClose() {
        this.setState({ mobileMoreAnchorEl: null });
    }

    render() {
        const { mobileMoreAnchorEl } = this.state;
        const { classes, t } = this.props;

        // I hasn't created an external component for this menu because I would has to pass props for click events...
        const renderMobileMenu = (
            <Menu
                // anchorEl: has to be a DOM element (object or function), eg: <button ...> or null.
                anchorEl={mobileMoreAnchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                open={Boolean(mobileMoreAnchorEl)}
                onClose={this.handleMobileMenuClose}
            >
                <ChatAppBarMenu />
            </Menu>
        );

        const renderNotificationIcon = (
            <Tooltip title={t('tooltip.icon-notification-off')}>
                <IconButton color="inherit">
                    <NotificationsOffIcons />
                </IconButton>
            </Tooltip>
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
                    <div className={classes.sectionDesktop}>
                        {renderNotificationIcon}
                        <Link
                            to={ROUTES.settings.path}
                            className={classes.linkButton}
                        >
                            <Tooltip title={t('tooltip.icon-settings')}>
                                <IconButton color="inherit">
                                    <AccountCircleIcon />
                                </IconButton>
                            </Tooltip>
                        </Link>
                        <Link
                            to={ROUTES.database.path}
                            className={classes.linkButton}
                        >
                            <Tooltip title={t('tooltip.icon-database')}>
                                <IconButton color="inherit">
                                    <TextFieldsIcon />
                                </IconButton>
                            </Tooltip>
                        </Link>
                    </div>
                    <div className={classes.sectionMobile}>
                        {renderNotificationIcon}
                        <MoreIcon onClickEvent={this.handleMobileMenuOpen} />
                        {renderMobileMenu}
                    </div>
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
