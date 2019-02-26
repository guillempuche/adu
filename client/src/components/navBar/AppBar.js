import React from 'react';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';

import ChatAppBar from './ChatAppBar';
import DatabaseBar from './DatabaseBar';
import SettingsBar from './SettingsBar';
import { ROUTES } from '../utils/routes';

const styles = theme => ({
    app: {
        width: '100%'
    }
});

/**
 * Main navigation bar component. This manages settings of the app bar according to the URLs.
 *
 * Components imported:
 * - `ChatAppBar`: bar for the chats view.
 * - `DatabaseBar`: bar for the database view.
 * - `SettingsBar`: bar for the settings view.
 */
function Bar({ location, classes }) {
    const renderAppBar = path => {
        if (path === ROUTES.app.path) return <ChatAppBar />;
        else if (path === ROUTES.database.path) return <DatabaseBar />;
        else if (path === ROUTES.settings.path) return <SettingsBar />;
    };

    return (
        <div className={classes.app}>
            <AppBar position="static">{renderAppBar(location.pathname)}</AppBar>
        </div>
    );
}

const enhance = compose(
    withRouter,
    withStyles(styles)
);

export default enhance(Bar);
