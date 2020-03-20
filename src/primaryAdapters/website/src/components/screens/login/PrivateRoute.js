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
import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth0 } from './auth0-wrapper';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';

import ROUTES from '../../../utils/routes';
import { GET_ME, GET_FACULTY_ID } from '../../../graphql/fetch';
import { areSomeRolesAllowed } from '../../../utils/utils';
import Unauthorized from './Unauthorized';

/**
 * Check if the user can access to the component. He has
 * to be authenticated, else we redirect him to the Login component.
 */
const PrivateRoute = ({
	rolesAllowed,
	component: Component,
	path,
	...rest
}) => {
	const { loading, isAuthenticated, loginWithRedirect } = useAuth0();

	const { error: userError, data: user } = useQuery(GET_ME);
	// It does not immediately execute.
	const [getFacultyId, { data: faculty, error: facultyError }] = useLazyQuery(
		GET_FACULTY_ID
	);
	// `true` if user is allowed, `false` if not, `null` if we're still fetching user data.
	const [userAllowed, setUserAllowed] = useState(null);

	// Example: https://github.com/auth0-samples/auth0-react-samples/blob/master/01-Login/src/components/PrivateRoute.js
	useEffect(() => {
		// If user isn't registered or logged in, then open Auth0 login/signup.
		const fn = async () => {
			console.log('URL ' + JSON.stringify(path));
			await loginWithRedirect({
				appState: { targetUrl: path }
				// // If user signs up, this role will be the default for him and used on Auth0 Rule.
				// // For see which role apply, see the Domain User.
				// role: 'user'
			});
		};

		if (isAuthenticated) {
			return;
		}
		fn();
	}, [isAuthenticated, path]);

	// Fetch faculty id, then check if user roles of that faculty are allowed.
	useEffect(() => {
		if (user && user.getMe && user.getMe.success) {
			// Get faculty id.
			if (!faculty || !faculty.facultyId) {
				console.log('Get faculty id');

				getFacultyId();
			} else {
				// Find organizations
				const {
					roles: userOrgRoles
				} = user.getMe.user.organizations.find(
					({ _id }) => _id === faculty.facultyId
				);
				console.log('userOrgRoles=' + userOrgRoles);
				if (
					userOrgRoles &&
					areSomeRolesAllowed(rolesAllowed, userOrgRoles)
				)
					setUserAllowed(true);
				else setUserAllowed(false);
			}
		}
	}, [user, faculty]);

	// // Fetch user roles.
	// useEffect(() => {
	//     async function getUserRoles() {
	//         const token = await getTokenSilently();
	//     }
	//     if (isAuthenticated) getUserRoles();
	// }, [isAuthenticated]);

	const render = props => {
		switch (isAuthenticated) {
			case true:
				if (userAllowed) return <Component {...props} />;
				else if (userAllowed === null)
					return 'Setting the environment...';
				else return <Unauthorized />;
			// return props.location.pathname === ROUTES.onboarding.path ? (
			//     <Redirect to={ROUTES.onboarding.path} />
			// ) : (
			//     <Component {...props} />
			// );
			default:
				return null;
		}
	};
	// const render = props =>
	//     isAuthenticated === true ? (
	//         <Redirect to={ROUTES.onboarding.path} />
	//     ) : null;

	return <Route path={path} render={render} {...rest} />;
};

// PrivateRoute.propTypes = {
// 	rolesAllowed: (props, propName) => {
// 		if (rolesValidator(props[propName]))return  new Error(`Invalid roles.`)
// 	}

// }

export default PrivateRoute;
