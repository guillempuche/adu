import produce from 'immer';
import * as types from '../actions/types';

const initialState = {
    all: [],
    selectedUser: null
};

/*
 * Initialy state is [] because when the app initializes, we don't know if
 * user is login before the app fetchs the user.
 *
 * @param {Object} state=initialState - Actual state.
 * @param {Object} action - Action data.
 * @return {Object} state - The new state
 */
export default function(state = initialState, action) {
    switch (action.type) {
        // Array of all users.
        case types.FETCH_ALL_USERS:
            return Object.assign({}, state, {
                all: action.users,
                allIds: action.usersId
            });
        case types.SELECTED_USER:
            return Object.assign({}, state, {
                selectedUser: action.payload
            });
        case types.EDIT_USER:
            const nextState = produce(state, draftState => {
                const { name, emailAccount, role } = action.userFieldsToUpdate;
                // The 2 variables point the same object.
                var allUsers = draftState.all;

                // Update only the user who has been edited.
                allUsers.forEach((user, index) => {
                    // Update fields for the edited user with these new values:
                    // name, email account & role.
                    if (user._id === draftState.selectedUser._id) {
                        allUsers[index].personalInfo.name.displayName = name;
                        allUsers[
                            index
                        ].personalInfo.emails.account = emailAccount;
                        allUsers[index].role = role;
                    }
                });
            });
            return nextState;
        case types.DELETE_SELECTED_USER:
            return Object.assign({}, state, {
                selectedUser: null
            });
        default:
            return state;
    }
}
