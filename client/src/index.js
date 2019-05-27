import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import i18next from 'i18next';
import 'moment/locale/es'; // Moment translated to spanish

import store from './reducers/store';
import './utils/locales/i18n';
import './index.css'; // Adjust the margin and padding of the body.
import { theme } from './materialDesignTheme';
import App from './components/App';

// Set the fallback language (the last element) to moment.
moment.locale(i18next.languages[i18next.languages.length - 1]);

ReactDOM.render(
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <App />
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
);
