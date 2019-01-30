import { FETCH_UNIVERSITY } from "../actions/types";

/*
 * Initialy state is null because when the app initializes, we don't know if
 * user is login before the app fetchs the user.
 */
export default function(state = null, action) {
    //console.log("university reducer - action", action);

    switch (action.type) {
        case FETCH_UNIVERSITY:
            return action.payload;
        default:
            return state;
    }
}
