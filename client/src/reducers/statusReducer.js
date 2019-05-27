/**
 * Status: network errors, fetch states.
 */
import _ from 'lodash';
import produce from 'immer';

import * as types from '../actions/types';

const initialState = {
    generalStatus: null,
    chatStatus: {
        chatMainStatus: null,
        /**
         * Array of objects. Can be:
         * - `{ id: 'roomSelected', value: { roomId: string, state: boolean }}`
         */
        fetching: []
    }
};

export default (state = initialState, action) => {
    let nextState;
    switch (action.type) {
        //  More info about network status: https://www.pubnub.com/docs/web-javascript/status-events
        case types.STATUS_CHAT_MAIN:
            nextState = produce(state, draft => {
                draft.chatStatus.chatMainStatus = action.payload;
            });
            return nextState;
        case types.STATUS_CHAT_FETCHING:
            nextState = produce(state, draft => {
                const { id, value } = action;
                const { fetching } = draft.chatStatus;

                if (_.isEmpty(fetching)) {
                    fetching.push({ id, value });
                } else {
                    fetching.find((element, index) => {
                        if (element.id === id) {
                            fetching[index].value = value;
                            return true;
                        }

                        return false;
                    });
                }
            });
            return nextState;
        default:
            return state;
    }
};
