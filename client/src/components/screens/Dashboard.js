import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import * as actions from '../../actions';
import { withStyles } from '@material-ui/core/styles';

import AppBar from '../navBar/AppBar';
import Chat from './Chat';
import Settings from './Settings';
import Database from './Database';
import { ROUTES } from '../utils/routes';

const styles = theme => ({});

/**
 * Dashboard where there are the main frames for the app.
 *
 * Main custom components used:
 * - `Appbar` - Navigation bar.
 * - `Chat`, `Settings`, `Database` - View of chat, settings and database frames,
 */
class Dashboard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router>
                <Fragment>
                    <Route path={ROUTES.app.path} component={AppBar} />
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
                </Fragment>
            </Router>
        );
    }
}

export default withStyles(styles)(Dashboard);
