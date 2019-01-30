import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { theme } from './materialDesignTheme';
import './index.css'; // Adjust the margin and padding of the body.

import App from './components/App';
import reducers from './reducers';
import './i18n';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    reducers,
    // PreloadedS state is the initial state of app
    {},
    // Inspect whatever value we return from the Action Creator with the dispatch function.
    composeEnhancers(applyMiddleware(reduxThunk))
);

ReactDOM.render(
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <App />
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
);
