import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import AppBar from '../navBar/AppBar';
import Chat from './Chat';
import Settings from '../settings/Settings';
import Database from './Database';
import { ROUTES } from '../utils/routes';

const styles = theme => ({
    body: {
        width: '100%',
        overflowY: 'auto'
    }
});

/**
 * Dashboard where there are the main frames for the app.
 *
 * Main custom components used:
 * - `Appbar` - Navigation bar.
 * - `Chat`, `Settings`, `Database` - View of chat, settings and database frames,
 */
function Dashboard({ classes }) {
    return (
        <Router>
            <Fragment>
                <Route path={ROUTES.app.path} component={AppBar} />
                <div className={classes.body}>
                    <Route exact path={ROUTES.app.path} component={Chat} />
                    <Route
                        exact
                        path={ROUTES.settings.path}
                        component={Settings}
                    />
                    <Route
                        exact
                        path={ROUTES.database.path}
                        component={Database}
                    />
                </div>
            </Fragment>
        </Router>
    );
}

export default withStyles(styles)(Dashboard);
