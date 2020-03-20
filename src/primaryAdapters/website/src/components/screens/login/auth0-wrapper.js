import React, { useState, useEffect, useContext } from 'react';
import createAuth0Client from '@auth0/auth0-spa-js';

const DEFAULT_REDIRECT_CALLBACK = () =>
	window.history.replaceState({}, document.title, window.location.pathname);

export const Auth0Context = React.createContext();
export const useAuth0 = () => useContext(Auth0Context);
/**
 * Create Auth0 provider
 * More information: https://github.com/auth0-samples/auth0-react-samples/blob/master/01-Login
 */
export const Auth0Provider = ({
	children,
	onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
	...initOptions
}) => {
	const [isAuthenticated, setIsAuthenticated] = useState();
	const [user, setUser] = useState();
	const [auth0Client, setAuth0] = useState();
	const [loading, setLoading] = useState(true);
	const [popupOpen, setPopupOpen] = useState(false);

	// Initalize the authentication.
	useEffect(() => {
		const initAuth0 = async () => {
			// Documentation: https://auth0.github.io/auth0-spa-js/classes/auth0client.html
			const auth0FromHook = await createAuth0Client(initOptions);
			setAuth0(auth0FromHook);

			if (window.location.search.includes('code=')) {
				const {
					appState
				} = await auth0FromHook.handleRedirectCallback();
				onRedirectCallback(appState);
			}

			const isAuthenticated = await auth0FromHook.isAuthenticated();

			setIsAuthenticated(isAuthenticated);

			if (isAuthenticated) {
				const user = await auth0FromHook.getUser();
				setUser(user);
			}

			setLoading(false);
		};
		initAuth0();
	}, []);

	const loginWithPopup = async (params = {}) => {
		setPopupOpen(true);
		try {
			await auth0Client.loginWithPopup(params);
		} catch (error) {
			console.error(error);
		} finally {
			setPopupOpen(false);
		}
		const user = await auth0Client.getUser();
		setUser(user);
		setIsAuthenticated(true);
	};

	const handleRedirectCallback = async () => {
		setLoading(true);
		await auth0Client.handleRedirectCallback();
		const user = await auth0Client.getUser();
		setLoading(false);
		setIsAuthenticated(true);
		setUser(user);
	};

	/**
	 * API reference: https://auth0.github.io/auth0-spa-js/
	 */
	return (
		<Auth0Context.Provider
			value={{
				isAuthenticated,
				user,
				loading,
				popupOpen,
				loginWithPopup,
				handleRedirectCallback,
				getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
				loginWithRedirect: (...p) =>
					auth0Client.loginWithRedirect(...p),
				getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
				getTokenWithPopup: (...p) =>
					auth0Client.getTokenWithPopup(...p),
				logout: (...p) => auth0Client.logout(...p)
			}}
		>
			{children}
		</Auth0Context.Provider>
	);
};
