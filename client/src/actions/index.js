/*
    Return the dispatch function. If Redux Thunk sees we return a function,
    then it passes the dispatch function as an argument. 
 */

import axios from "axios";
import {
    FETCH_USER,
    FETCH_UNIVERSITY,
    FETCH_CLIENT,
    FETCH_ALL_CLIENTS,
    SELECT_CHAT,
    OPEN_SIDENAV
} from "./types";

// Dispatch the User model
export const fetchUser = () => async dispatch => {
    const res = await axios.get("/api/current_user");

    dispatch({
        type: FETCH_USER,
        payload: res.data
    });
};

// Dispatch the University model
export const fetchUniversity = () => async dispatch => {
    const res = await axios.get("/api/university");

    dispatch({
        type: FETCH_UNIVERSITY,
        payload: res.data
    });
};

export const newClient = (client, university) => async dispatch => {
    const res = await axios.post("/api/client/new", { client, university });

    dispatch({
        type: FETCH_CLIENT,
        payload: res.data
    });
};

export const fetchAllClients = university => async dispatch => {
    const res = await axios.post("/api/client/all", university);

    dispatch({
        type: FETCH_ALL_CLIENTS,
        payload: res.data
    });
};

export const selectChat = client => dispatch => {
    dispatch({
        type: SELECT_CHAT,
        payload: client
    });
};

export const submitNewUniversityForm = name => async dispatch => {
    console.log("action UniversityForm =", name);

    const res = await axios.post("/api/user/university/new", name);

    console.log("action UniversityForm response =", res);

    dispatch({
        type: FETCH_USER,
        payload: res.data
    });
};

export const submitNewEmailForm = name => async dispatch => {
    console.log("action EmailForm =", name);

    const res = await axios.post("/api/user/email/new", name);

    console.log("action EmailForm response =", res);

    dispatch({
        type: FETCH_USER,
        payload: res.data
    });
};

// When the sidenav is opened or closed we save the value.
export const openSideNav = open => async dispatch => {
    dispatch({
        type: OPEN_SIDENAV,
        payload: { openSideNav: open }
    });
};
