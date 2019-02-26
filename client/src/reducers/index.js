import { combineReducers } from 'redux';
import { reducer as reduxForm } from 'redux-form';
import authReducer from './authReducer';
import userReducer from './userReducer';
import universityReducer from './universityReducer';
import clientReducer from './clientReducer';
import chatReducer from './chatReducer';

// Object that has the pieces of all states given by keys.
export default combineReducers({
    auth: authReducer,
    user: userReducer,
    university: universityReducer,
    client: clientReducer,
    chat: chatReducer,
    form: reduxForm
});
