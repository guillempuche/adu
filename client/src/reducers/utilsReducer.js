import { OPEN_SIDENAV } from "../actions/types";

export default function(state = null, action) {
    switch (action.type) {
        case OPEN_SIDENAV:
            return action.payload;
        default:
            return state;
    }
}
