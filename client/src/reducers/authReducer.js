import { FETCH_USER } from "../actions/types";

/*
 * Initialy state is null because when the app initializes, we don't know if
 * user is login before the app fetchs the user.
 */
export default function(state = null, action) {
    switch (action.type) {
        case FETCH_USER:
            /*
                3 state's values:
                    - null | false | action payload
                    
                If user is logout, the api return an empty string (=== false). Else
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
