import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
// Import all Action Creators.
import * as actions from '../actions';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// Import components.
import PrivateRoute from './login/PrivateRoute';
import Landing from './landing/Landing';
import Dashboard from './screens/Dashboard';
import SignUpOrLogin from './login/SignUpOrLogin';
import { ROUTES } from './utils/routes';

class App extends Component {
    /*state = {
        externalDataLoaded: false
    };*/

    // TIP: This function only allow dispatch one action creator
    async componentDidMount() {
        // Fetch the current user when the app initializes.
        try {
            await this.props.fetchUser();
        } catch (err) {
            console.error(err);
        }
    }

    /*
    static getDerivedStateFromProps(props, state) {
        // Store prevId in state so we can compare when props change.
        // Clear out previously-loaded data (so we don't render stale stuff).

        if (!props.auth || !props.university) {
            return { externalDataLoaded: false };
        }

        return { externalDataLoaded: true };
    }

    async componentDidUpdate(prevProps, prevState) {
        // Fetch user's university.
        if (!this.state.externalDataLoaded && !this.props.university) {
            try {
                await this.props.fetchUniversity();
            } catch (err) {
                console.error(err);
            }
        }
    }*/

    render() {
        return (
            <div className="App">
                <Router>
                    <Fragment>
                        {/* Anyone `will` be able to access '/', but anyone who tries to access '/app', who isn’t authenticated, will get redirected to /login. */}
                        <Route
                            exact
                            path={ROUTES.landing.path}
                            component={Landing}
                        />
                        <Route
                            path={ROUTES.login.path}
                            component={SignUpOrLogin}
                        />
                        <PrivateRoute
                            path={ROUTES.app.path}
                            component={Dashboard}
                        />
                    </Fragment>
                </Router>
            </div>
        );
    }
}

function mapStateToProps({ auth }) {
    return {
        auth
    };
}
export default connect(
    mapStateToProps,
    actions
)(App);
