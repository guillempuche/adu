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
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect, withRouter } from 'react-router-dom';

import ROUTES from '../../../utils/routes';
import * as actions from '../../../actions';

/**
 * @class Check if the user can access to the component. He has
 * to be authenticated, else we redirect him to the Login component.
 */
class PrivateRoute extends Component {
    constructor(props) {
        super(props);

        this.checkAuth = this.checkAuth.bind(this);
    }

    checkAuth(props, Component) {
        const { auth } = this.props;

        switch (auth) {
            case null:
                return null;
            case false:
                return <Redirect to={ROUTES.login.path} />;
            default:
                // If the user isn't a superadmin, hasn't any link
                // with some faculty & isn't in Onboarding URL,
                // then redirect to the Onboarding component.
                if (
                    auth.userType.superadmin === false &&
                    auth._faculties.length === 0 &&
                    props.location.pathname !== ROUTES.onboarding.path
                )
                    return <Redirect to={ROUTES.onboarding.path} />;
                else return <Component {...props} />;
        }
    }

    render() {
        const { component: Component, ...rest } = this.props;

        return (
            <Route
                {...rest}
                render={props => this.checkAuth(props, Component)}
            />
        );
    }
}

function mapStateToProps({ auth }) {
    return { auth };
}

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withRouter
);

export default enhancer(PrivateRoute);
