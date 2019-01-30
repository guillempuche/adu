/*
    React Router doesn't give us a Route component, they don't also gave us a PrivateRoute component which would render the component only if the user was authenticated.
    
    We create our own.

    Here are the requirements for our PrivateRoute component.
        1. It has the same API as <Route />.
        2. It renders a <Route /> and passes all the props through to it.
        3. It checks if the user is authenticated, if they are, it renders the “component” prop. If not, it redirects the user to /login.

    More info:
        - https://tylermcginnis.com/react-router-protected-routes-authentication/
        - https://reacttraining.com/react-router/web/example/auth-workflow

*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

import { ROUTES } from '../utils/routes';

/*
    When we redirect the user for not being authenticated, we need
    to pass along the current route they’re trying to visit so we can
    come back to it after they authenticate. 
*/
class PrivateRoute extends Component {
    constructor(props) {
        super(props);

        this.checkAuth = this.checkAuth.bind(this);
    }

    checkAuth(props, auth, Component) {
        switch (auth) {
            case null:
                return null;
            case false:
                return <Redirect to={ROUTES.login.path} />;
            default:
                return <Component {...props} />;
        }
    }

    render() {
        const { auth, component: Component, ...rest } = this.props;

        return (
            <Route
                {...rest}
                render={() => this.checkAuth(this.props, auth, Component)}
            />
        );
    }
}

function mapStateToProps({ auth }) {
    return {
        auth
    };
}

export default connect(mapStateToProps)(PrivateRoute);
