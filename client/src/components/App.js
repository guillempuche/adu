import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
// Import all Action Creators.
import * as actions from '../actions';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from 'react-router-dom';

// Imported components.
import PrivateRoute from './login/PrivateRoute';
import Dashboard from './screens/Dashboard';
import Landing from './screens/Landing';
import SignupAndLogin from './login/SignupAndLogin';
import Onboarding from './screens/Onboarding';
import { ROUTES } from './utils/routes';

class App extends Component {
    // Fetch the current user when the app initializes.
    componentDidMount() {
        this.props.fetchUser();
    }

    render() {
        return (
            <div className="App">
                <Router>
                    <Switch>
                        {/* Anyone will be able to access Landing or Login page, but anyone who tries to access the Dashboard page and who isn’t authenticated, will get redirected to /login. */}
                        <PrivateRoute
                            exact
                            path={ROUTES.app.path}
                            component={Dashboard}
                        />
                        <PrivateRoute
                            exact
                            path={ROUTES.onboarding.path}
                            component={Onboarding}
                        />
                        <Route
                            exact
                            path={ROUTES.login.path}
                            component={SignupAndLogin}
                        />
                        <Route
                            exact
                            path={ROUTES.landing.path}
                            component={Landing}
                        />
                        {/** Default route if user goes to undefined URLs. */}
                        <Redirect to={ROUTES.app.path} />
                    </Switch>
                </Router>
            </div>
        );
    }
}

export default connect(
    null,
    actions
)(App);
