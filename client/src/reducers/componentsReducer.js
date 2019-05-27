import produce from 'immer';

import * as types from '../actions/types';

const initialState = {
    chat: {
        profileDialog: false // Open (true) & close (false) the dialog component.
    }
};

export default function(state = initialState, action) {
    let nextState;
    switch (action.type) {
        case types.COMPONENT_PROFILE_DIALOG:
            nextState = produce(state, draft => {
                draft.chat.profileDialog = !draft.chat.profileDialog;
            });
            return nextState;
        default:
            return state;
    }
}
