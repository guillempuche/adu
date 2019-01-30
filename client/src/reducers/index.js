import { combineReducers } from "redux";
import { reducer as reduxForm } from "redux-form";
import authReducer from "./authReducer";
import universityReducer from "./universityReducer";
import clientReducer from "./clientReducer";
import chatReducer from "./chatReducer";
import utilsReducer from "./utilsReducer";

// Object that has the pieces of all states given by keys.
export default combineReducers({
    auth: authReducer,
    university: universityReducer,
    client: clientReducer,
    chat: chatReducer,
    form: reduxForm,
    // All type of data
    utils: utilsReducer
});
