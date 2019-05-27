import React, { Component, Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import ROUTES from '../utils/routes';
import * as actions from '../actions';
import PrivateRoute from './screens/login/PrivateRoute';
import SignupAndLogin from './screens/login/SignupAndLogin';
import Dashboard from './screens/Dashboard';
import Onboarding from './screens/Onboarding';
import ChatClient from './screens/chat/individual/ChatClient';
import Landing from './screens/Landing';

const styles = theme => ({
    app: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    }
});

class App extends Component {
    componentDidMount() {
        // Fetch the current user when the app initializes.
        this.props.fetchUser();
    }

    render() {
        const { classes } = this.props;

        /**
         * The Routes are only rendered when their URL are matched.
         *
         * Anyone will be able to access Landing or Login page, but anyone
         * who tries to access the Private Route and who isn’t authenticated,
         * will get redirected to the Login component.
         */
        return (
            <Router>
                <Fragment>
                    <Switch>
                        <Route
                            path={ROUTES.login.path}
                            component={SignupAndLogin}
                        />
                        <PrivateRoute
                            path={ROUTES.onboarding.path}
                            component={Onboarding}
                        />
                        <Route
                            exact
                            path={ROUTES.chatClient.path}
                            component={ChatClient}
                        />
                        <Route
                            exact
                            path={ROUTES.landing.path}
                            component={Landing}
                        />
                        <PrivateRoute
                            path={ROUTES.app.path}
                            component={Dashboard}
                        />
                    </Switch>
                </Fragment>
            </Router>
        );
    }
}

const enhancer = compose(
    connect(
        null,
        actions
    ),
    withStyles(styles)
);

export default enhancer(App);
