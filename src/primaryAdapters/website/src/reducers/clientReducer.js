import * as types from '../actions/types';

export default function(state = {}, action) {
    switch (action.type) {
        case types.CLIENT_FETCH:
            return action.payload;
        default:
            return state;
    }
}
