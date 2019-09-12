import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import moment from 'moment';
import i18next from 'i18next';
import 'moment/locale/es'; // Moment translated to spanish

import store from './reducers/store';
import './utils/locales/i18n';
import './index.css'; // Adjust the margin and padding of the body.
import { theme } from './materialDesignTheme';
import App from './components/App';

// Set up Apollo GraphQL Client
const param = {
    link: ApolloLink.from([
        onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors)
                graphQLErrors.map(({ message, locations, path }) =>
                    console.error(
                        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
                    )
                );
            if (networkError) console.error(`[Network error]: ${networkError}`);
        }),
        new HttpLink({
            uri: '/api/graphql',
            credentials: 'same-origin'
        })
    ]),
    cache: new InMemoryCache(),
    connectToDevTools: true
};

const client = new ApolloClient(param);

// Set the fallback language (the last element) to moment.
moment.locale(i18next.languages[i18next.languages.length - 1]);

ReactDOM.render(
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <ApolloProvider client={client}>
                <ApolloHooksProvider client={client}>
                    <App />
                </ApolloHooksProvider>
            </ApolloProvider>
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
);
