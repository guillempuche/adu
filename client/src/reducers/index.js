import { combineReducers } from 'redux';
import { reducer as reduxForm } from 'redux-form';

import authReducer from './authReducer';
import userReducer from './userReducer';
import clientReducer from './clientReducer';
import chatReducer from './chatReducer';
import faqsReducer from './faqsReducer';
import settingsReducer from './settingsReducer';
import errorReducer from './errorReducer';
import statusReducer from './statusReducer';
import componentsReducer from './componentsReducer';

// Object that has the pieces of all states given by keys.
export default combineReducers({
    auth: authReducer,
    user: userReducer,
    client: clientReducer,
    chat: chatReducer,
    faqs: faqsReducer,
    settings: settingsReducer,
    error: errorReducer,
    status: statusReducer,
    components: componentsReducer,
    form: reduxForm
});
