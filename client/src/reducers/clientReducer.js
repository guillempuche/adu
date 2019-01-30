import { FETCH_CLIENT, FETCH_ALL_CLIENTS } from "../actions/types";

export default function(state = null, action) {
    switch (action.type) {
        case FETCH_CLIENT:
            // Object spread syntax from ES6
            return {
                ...state,
                client: action.payload
            };
        case FETCH_ALL_CLIENTS:
            return {
                ...state,
                allClients: action.payload
            };
        default:
            return state;
    }
}
