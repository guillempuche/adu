import React, { Fragment, useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useAuth0 } from './screens/login/auth0-wrapper';
import { ApolloProvider, useLazyQuery } from '@apollo/react-hooks';

import getApolloClient from '../graphql/apollo';
import { GET_FACULTY_ID } from '../graphql/fetch';
import ROUTES from '../utils/routes';
import PrivateRoute from './screens/login/PrivateRoute';
import OpenInvitation from './screens/login/Invitation';
import Dashboard from './screens/Dashboard';
import Onboarding from './screens/Onboarding';
import ChatClient from './screens/chat/individual/ChatClient';
import { rolesFormatValidator } from '../utils/utils';

/**
 * Set GraphQL Apollo Client and render the main routes.
 */
function App() {
	const [accessToken, setAccessToken] = useState();
	const { loading, isAuthenticated, getTokenSilently } = useAuth0();

	useEffect(() => {
		const getToken = async () => {
			const token = await getTokenSilently();
			setAccessToken(token);
		};

		if (isAuthenticated) getToken();
		else {
			// If access token fetched is undefined, then save access token as `undefined`.
			setAccessToken(undefined);
		}
	}, [isAuthenticated]);

	// Set GraphQL Apollo Client and the header authorization.
	const [client, setClient] = useState();
	useEffect(() => {
		setClient(getApolloClient(accessToken));
	}, [accessToken]);

	// useEffect(() => {
	// 	if (client) {
	// 		if(!data || !data.facultyId) getFacultyId();

	// 		console.log('Faculty id=' + data.facultyId);
	// 	}
	// }, [client, data, getFacultyId]);

	// if (data && data.facultyId) console.log('Faculty id=' + data.facultyId);

	if (loading) return 'Loading...';

	/**
	 * The Routes are only rendered when their URL are matched.
	 *
	 * Anyone will be able to access Landing or Login page, but anyone
	 * who tries to access the Private Route and who isn’t authenticated,
	 * will get redirected to the Login component.
	 */
	return (
		<ApolloProvider client={client}>
			<Router>
				<Fragment>
					<Switch>
						{/* <Route
                            path={ROUTES.login.path}
                            component={SignupAndLogin}
                        /> */}
						<PrivateRoute
							path={ROUTES.onboarding.path}
							component={Onboarding}
						/>
						<PrivateRoute
							path={ROUTES.invitation.path}
							component={OpenInvitation}
						/>
						<Route
							exact
							path={ROUTES.chatClient.path}
							component={ChatClient}
						/>
						<PrivateRoute
							path={ROUTES.app.path}
							component={Dashboard}
							rolesAllowed={rolesFormatValidator(['agent'])}
						/>
					</Switch>
				</Fragment>
			</Router>
		</ApolloProvider>
	);
}

export default App;
