import * as types from '../actions/types';

export default function(state = null, action) {
    switch (action.type) {
        case types.APP_SETTINGS_FETCH:
            return action.payload;
        default:
            return state;
    }
}
