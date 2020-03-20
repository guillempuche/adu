/**
 * Errors created by the app (and not by the network).
 *
 * The names of each property of the initial state has to
 * contain the name of its parent property, eg:
 * `clientError`+`SetAttributes`. This makes more easy to
 * know what the error is about throughout the components.
 */
import produce from 'immer';

import * as types from '../actions/types';

const initialState = {
    generalError: null, // If there's an error, we put the error explanation.
    clientError: {
        clientErrorSetAttributes: null // Can be string: 'email'.
    },
    chatError: {
        chatFatalError: false,
        chatErrorGeneral: null, // If there's an error, we put the error explanation translated to be shown to UI.
        chatErrorMessageNotSavedToDatabase: {}, // When the back-end can't save a message, we fill it with the message.
        chatErrorMessageNotSent: [] // When the PubNub can't send a message, we add the message.
    }
};

export default function(state = initialState, action) {
    let nextState;
    switch (action.type) {
        case types.ERROR:
            console.error(action.payload);
            return Object.assign({}, state, {
                generalError: action.payload
            });
        case types.ERROR_CLIENT_SET_ATTRIBUTE:
            nextState = produce(state, draft => {
                if (action.payload) {
                    console.error(
                        'errorReducer - ERROR_CLIENT_SET_ATTRIBUTE',
                        action.payload
                    );

                    draft.clientError.clientErrorSetAttributes = action.payload;
                } else {
                    // Set to default if there isn't any error.
                    draft.clientError.clientErrorSetAttributes = null;
                }
            });
            return nextState;
        case types.ERROR_CHAT_FATAL:
            nextState = produce(state, draft => {
                console.error(
                    'errorReducer - ERROR_CHAT_FATAL',
                    action.payload
                );

                draft.chatError.chatFatalError = action.payload;
            });
            return nextState;
        case types.ERROR_CHAT_GENERAL:
            nextState = produce(state, draft => {
                console.error(
                    'errorReducer - ERROR_CHAT_GENERAL',
                    action.payload
                );

                draft.chatError.chatErrorGeneral = action.payload;
            });
            return nextState;
        case types.CHAT_STATUS_MESSAGE_SAVED_TO_DATABASE:
            nextState = produce(state, draft => {
                const { isError, message } = action.payload;
                if (isError) {
                    console.error(
                        'errorReducer - CHAT_STATUS_MESSAGE_SAVED_TO_DATABASE',
                        action.payload
                    );

                    draft.chatError.chatErrorMessageNotSavedToDatabase = message;
                } else draft.chatError.chatErrorMessageNotSavedToDatabase = {};
            });
            return nextState;
        case types.CHAT_STATUS_MESSAGE_SEND:
            nextState = produce(state, draft => {
                const { isError, message } = action.payload;
                if (isError) {
                    console.error(
                        'errorReducer - CHAT_STATUS_MESSAGE_SEND',
                        action.payload
                    );

                    draft.chatError.chatErrorMessageNotSent.push(message);
                }
            });
            return nextState;
        default:
            return state;
    }
}
