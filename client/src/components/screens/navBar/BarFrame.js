import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { withRouter, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import MessageIcon from '@material-ui/icons/Message';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import ROUTES from '../../../utils/routes';
import BarChat from './bars/chat/BarChat';
import BarFAQs from './bars/BarFAQs';
import BarSettings from './bars/BarSettings';

const styles = theme => ({
    appBarTheme: theme.components.appBar.shadow,
    appBarMargins: theme.components.appBar.sideMargins,
    appBar: {
        width: '100%'
    },
    appBarNavigationIcon: theme.components.appBar.navigationIcon,
    barFrame: {
        display: 'flex',
        alignItems: 'center',
        width: '100%'
    },
    childrenBar: {
        flexGrow: 1
    },
    drawerTitle: {
        margin: '22px 16px 18px 16px'
    },
    // barFrameTheme: theme.components.appBar.margins,
    link: {
        textDecoration: 'none'
    }
});

/**
 * @class We render different main bars according to the url & render the Drawer.
 *
 * Follow the standard dimensions for App Bar, Drawer & List:
 *      - https://material.io/design/components/app-bars-top.html#specs
 *      - https://material.io/design/components/navigation-drawer.html#specs
 *      - https://material.io/design/components/lists.html#specs
 */
class BarFrame extends Component {
    constructor(props) {
        super(props);

        this.state = { openDrawer: false };

        this.handleDrawer = this.handleDrawer.bind(this);
        this.renderList = this.renderList.bind(this);
        this.goTo = this.goTo.bind(this);
        this.isSelected = this.isSelected.bind(this);
        this.renderMenuIcon = this.renderMenuIcon.bind(this);
    }

    /**
     * Toggle the Drawer's opening state.
     */
    handleDrawer() {
        this.setState(({ openDrawer }) => ({
            openDrawer: !openDrawer
        }));
    }

    /**
     * Render the whole list.
     */
    renderList() {
        const { classes, t } = this.props;
        return (
            <List>
                <ListItem
                    key="chats"
                    button
                    selected={this.isSelected(ROUTES.chatUser.path)}
                    onClick={() => this.goTo(ROUTES.chatUser.path)}
                >
                    <ListItemIcon>
                        <MessageIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('chatList')} />
                </ListItem>
                <ListItem
                    key="faqs"
                    button
                    selected={this.isSelected(ROUTES.faqs.path)}
                    onClick={() => this.goTo(ROUTES.faqs.path)}
                >
                    <ListItemIcon>
                        <TextFieldsIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('faqs')} />
                </ListItem>
                <ListItem
                    key="settings"
                    button
                    selected={this.isSelected(ROUTES.settings.path)}
                    onClick={() => this.goTo(ROUTES.settings.path)}
                >
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('settings')} />
                </ListItem>
                <a href={ROUTES.logout.path} className={classes.link}>
                    <ListItem key="logout" button>
                        <ListItemIcon>
                            <ExitToAppIcon />
                        </ListItemIcon>
                        <ListItemText primary={t('logout')} />
                    </ListItem>
                </a>
            </List>
        );
    }

    /**
     * Redirect to the given URL & close the Drawer.
     *
     * @param {string} path URL's path where we want to redirect.
     */
    goTo(path) {
        this.props.history.push(path);

        this.handleDrawer();
    }

    /**
     * Return if the current URL is the same as the list item.
     * @param {*} path URL's path
     * @return {boolean}
     */
    isSelected(path) {
        const { pathname } = this.props.location;

        if (pathname === path) return true;
        else return false;
    }

    renderMenuIcon() {
        return (
            <div>
                <IconButton
                    color="inherit"
                    onClick={this.handleDrawer}
                    className={this.props.classes.appBarNavigationIcon}
                >
                    <MenuIcon />
                </IconButton>
            </div>
        );
    }

    render() {
        const { openDrawer } = this.state;
        const { auth, classes } = this.props;

        const email = _.truncate(auth.personalInfo.emails.auth, { length: 25 });

        return (
            <Fragment>
                <Route exact={false} path={ROUTES.chatClient.path}>
                    <AppBar
                        position="static"
                        className={classNames(
                            classes.appBarTheme,
                            classes.appBar,
                            classes.appBarMargins
                        )}
                    >
                        <Toolbar disableGutters>
                            <div className={classes.barFrame}>
                                <Route
                                    exact
                                    path={ROUTES.chatUser.path}
                                    render={this.renderMenuIcon}
                                />
                                <Route
                                    path={[
                                        ROUTES.faqs.path,
                                        ROUTES.settings.path
                                    ]}
                                    render={this.renderMenuIcon}
                                />
                                <div className={classes.childrenBar}>
                                    <Route
                                        path={ROUTES.chatUser.path}
                                        component={BarChat}
                                    />
                                    <Route
                                        path={ROUTES.faqs.path}
                                        component={BarFAQs}
                                    />
                                    <Route
                                        path={ROUTES.settings.path}
                                        component={BarSettings}
                                    />
                                </div>
                            </div>
                        </Toolbar>
                    </AppBar>
                    <Drawer
                        anchor="left"
                        open={openDrawer}
                        onClose={this.handleDrawer}
                    >
                        <div>
                            <div className={classes.drawerTitle}>
                                <Typography variant="h5">Au</Typography>
                                <Typography variant="caption">
                                    {email}
                                </Typography>
                            </div>
                            <div>{this.renderList()}</div>
                        </div>
                    </Drawer>
                </Route>
            </Fragment>
        );
    }
}

function mapStateToProps({ auth }) {
    return { auth };
}

const enhancer = compose(
    connect(mapStateToProps),
    withRouter,
    withNamespaces('routesTitles'),
    withStyles(styles)
);

export default enhancer(BarFrame);
