import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core/styles';

// Translations
import moment from 'moment';
import i18next from 'i18next';
import 'moment/locale/es'; // Moment translated to spanish

import store from './reducers/store';
import './utils/locales/i18n';
import './index.css'; // Adjust the margin and padding of the body.
import { theme } from './materialDesignTheme';
import App from './components/App';
import { Auth0Provider } from './components/screens/login/auth0-wrapper';

// Set the fallback language (the last element) to moment.
moment.locale(i18next.languages[i18next.languages.length - 1]);

// A function that routes the user to the right place
// after login
const onRedirectCallback = appState => {
	window.history.replaceState(
		{},
		document.title,
		appState && appState.targetUrl
			? appState.targetUrl
			: window.location.pathname
	);
};

ReactDOM.render(
	<Auth0Provider
		domain={process.env.REACT_APP_AUTH0_DOMAIN}
		client_id={process.env.REACT_APP_AUTH0_CLIENT_ID}
		redirect_uri={window.location.origin}
		audience={process.env.REACT_APP_AUTH0_AUDIENCE_USER_API}
		onRedirectCallback={onRedirectCallback}
	>
		<MuiThemeProvider theme={theme}>
			<Provider store={store}>
				<App />
			</Provider>
		</MuiThemeProvider>
	</Auth0Provider>,
	document.getElementById('root')
);
