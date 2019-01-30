import { SELECT_CHAT } from "../actions/types";

export default function(state = null, action) {
    switch (action.type) {
        case SELECT_CHAT:
            return {
                ...state,
                chat: action.payload
            };
        default:
            return state;
    }
}
