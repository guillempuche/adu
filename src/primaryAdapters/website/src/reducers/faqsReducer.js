import produce from 'immer';

import * as types from '../actions/types';

const initialState = {
    questions: {
        all: null // It will be an array.
    },
    answers: {}
};

export default function(state = initialState, action) {
    let nextState;
    switch (action.type) {
        case types.FAQS_QUESTIONS_FETCH_ALL:
            nextState = produce(state, draft => {
                draft.questions.all = action.payload;
            });
            return nextState;
        case types.FAQS_QUESTIONS_EDIT:
            nextState = produce(state, draft => {
                action.payload.forEach(questionUpdated => {
                    // Find the updated question on the list of questions to replace with the new version.
                    draft.questions.all.find((question, index) => {
                        if (question._id === questionUpdated._id) {
                            draft.questions.all[index] = questionUpdated;
                            return true;
                        }

                        return false;
                    });
                });
            });
            return nextState;
        default:
            return state;
    }
}
