/*
    Return the dispatch function. If Redux Thunk sees we return a function,
    then it passes the dispatch function as an argument. 
 */

import axios from 'axios';
import {
    FETCH_USER,
    FETCH_ALL_USERS,
    SELECTED_USER,
    EDIT_USER,
    DELETE_SELECTED_USER
} from './types';

/**
 * Dispatch (= return) the User model.
 */
const fetchUser = () => async dispatch => {
    try {
        const res = await axios.get('/api/current_user');

        dispatch({
            type: FETCH_USER,
            payload: res.data
        });
    } catch (err) {
        console.log(err);
    }
};

/**
 * Get all users list according to user permission:
 * - Superadmin: get all users
 * - Admin: get users only from his faculty
 */
const fetchAllUsers = () => async dispatch => {
    try {
        const res = await axios.get('/api/users/all');
        const { users, usersId } = res.data;

        dispatch({
            type: FETCH_ALL_USERS,
            users,
            usersId
        });
    } catch (err) {
        console.log(err);
    }
};

/**
 * Change data for a user and then update all users list.
 *
 * @param {String} userId - User's id to know which user we have to modify.
 * @param {String} [displayName=undefined] - New user's name.
 * @param {String} [otherEmail=undefined] - New user's email.
 * @param {String} [role=undefined] - New user's role.
 */
const editUser = newUserValues => async dispatch => {
    try {
        const { data } = await axios.post('/api/users/edit', newUserValues);

        console.log(data);

        /**
         * Update state that has all users list with the new user data.
         * @param {Object} userFieldsToUpdate - It's true if user edition has been success.
         */
        dispatch({
            type: EDIT_USER,
            userFieldsToUpdate: {
                name: data.personalInfo.name.displayName,
                emailAccount: data.personalInfo.emails.account,
                role: data.role
            }
        });
    } catch (err) {
        console.log(err);
    }
};

/**
 * Save the user's id selected.
 * @param {object} user - User data
 */
const selectedUser = user => dispatch => {
    dispatch({
        type: SELECTED_USER,
        payload: user
    });
};

/**
 * Delete the user's id selected.
 */
const deleteSelectedUser = () => dispatch => {
    dispatch({
        type: DELETE_SELECTED_USER
    });
};

export { fetchUser, editUser, fetchAllUsers, selectedUser, deleteSelectedUser };
