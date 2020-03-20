import * as types from '../actions/types';

/*
 * Initialy state is `null` because when the app initializes, we don't know if
 * user is logined before the app fetchs the user.
 */
export default function(state = null, action) {
    switch (action.type) {
        case types.USER_SAVE:
            /*
                3 state's values:
                    - null | false | action's payload
                    
                If user is logout, the API return an empty string (=== false). Else
                returns the user model.
                Cases:
                    - false (or empty string) || (anything), return (anything): If payload is an empty string ("" === false)  false, return false
                    - true (or user model)|| (anything), return user model.
            */
            return action.payload || false;
        default:
            return state;
    }
}
