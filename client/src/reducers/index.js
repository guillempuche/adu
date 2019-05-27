import { combineReducers } from 'redux';
import { reducer as reduxForm } from 'redux-form';

import errorReducer from './errorReducer';
import authReducer from './authReducer';
import userReducer from './userReducer';
import chatReducer from './chatReducer';
import clientReducer from './clientReducer';
import statusReducer from './statusReducer';
import componentsReducer from './componentsReducer';

// Object that has the pieces of all states given by keys.
export default combineReducers({
    auth: authReducer,
    user: userReducer,
    client: clientReducer,
    chat: chatReducer,
    error: errorReducer,
    status: statusReducer,
    components: componentsReducer,
    form: reduxForm
});
