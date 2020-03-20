/**
 * Actions Creators.
 *
 * We deal with:
 * - authentification
 * - user data
 * - client data
 * - chat: rooms & messages
 * - errors
 */
import _ from 'lodash';
import axios from 'axios';

import * as types from './types';
import error from './errorHandler';
import {
    sendMessage,
    isMessageValid,
    sendGoToBlocks
} from '../utils/chat/messageUtils';
import {
    unsubscribeFromChannels,
    subscribeToChannels,
    setState
} from '../utils/chat/pubnub';
import { createUUID } from '../utils/chat/chatUtils';

export {
    fetchAppSettings,
    fetchUser,
    editUser,
    fetchAllUsers,
    selectedUser,
    deleteSelectedUser,
    fetchRooms,
    saveGlobalChannels,
    selectRoom,
    updateRoomsList,
    fetchClient,
    setClientAttributes,
    fetchPublicClientRoom,
    savePubnubInstance,
    saveRoomChannels,
    setRoomAttributes,
    saveAndSendMessage,
    saveMessageToDatabase,
    saveMessageToState,
    sendMessageViaPubnub,
    sendGoToBlocksViaPubnub,
    fetchHistory,
    saveAttachedFile,
    deleteAllAttachedFiles,
    fetchAllQuestions,
    saveQuestions,
    setError,
    setChatFatalError,
    setChatErrorGeneral,
    setChatStatus,
    setChatStatusFetching,
    handleComponentProfileDialog
};

/**
 * Get user's data and save it.
 */
const fetchAppSettings = () => async dispatch => {
    try {
        const settings = await axios.get('/api/settings');

        dispatch({
            type: types.APP_SETTINGS_FETCH,
            payload: settings.data
        });
    } catch (err) {
        console.error(err);

        dispatch({
            type: types.ERROR,
            payload: `Problem fetching the app's settings`
        });
    }
};

/**
 * Get user's data and save it.
 */
const fetchUser = () => async dispatch => {
    try {
        const user = await axios.get('/api/current_user');

        dispatch({
            type: types.USER_SAVE,
            payload: user.data
        });
    } catch (err) {
        console.error(err);
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
            type: types.FETCH_ALL_USERS,
            users,
            usersId
        });
    } catch (err) {
        console.error(err);
    }
};

/**
 * Change data for a user and then update all users list.
 *
 * @param {String} userId - User's id to know which user we have to modify.
 * @param {String} [formValues.displayName=undefined] - New user's name.
 * @param {String} [formValues.otherEmail=undefined] - New user's email.
 * @param {String} [formValues.role=undefined] - New user's role.
 */
const editUser = (userId, formValues) => async dispatch => {
    try {
        const { data } = await axios.put(
            `/api/users/${userId}/edit`,
            formValues
        );

        /**
         * Update state that has all users list with the new user data.
         * @param {Object} userFieldsToUpdate - It's true if user edition has been success.
         */
        dispatch({
            type: types.EDIT_USER,
            userFieldsToUpdate: {
                name: data.personalInfo.name.displayName,
                emailAccount: data.personalInfo.emails.account,
                role: data.role
            }
        });
    } catch (err) {
        console.error(err);
    }
};

/**
 * Save the user's id selected.
 *
 * @param {object} user - User data
 */
const selectedUser = user => dispatch => {
    dispatch({
        type: types.SELECTED_USER,
        payload: user
    });
};

/**
 * Delete the user selected.
 */
const deleteSelectedUser = () => dispatch => {
    dispatch({
        type: types.DELETE_SELECTED_USER
    });
};

/**
 * Fetch the client or create a new client (visitor who uses
 * with the public chat) if he doesn't exist on the database.
 * @param {string} facultyId
 */
const fetchClient = facultyId => async dispatch => {
    try {
        const client = await axios.get(
            `/api/public/clients?facultyId=${facultyId}`
        );

        dispatch({
            type: types.CLIENT_FETCH,
            payload: client.data
        });
    } catch (err) {
        error(err, 'chatFatalError', dispatch);
    }
};

/**
 * Get the most recent rooms according to their newest message &
 * save them to Redux Store.
 * Steps:
 * 1. fetch all chat rooms from the user's faculty
 * 2. save the number of rooms of the faculty
 */
const fetchRooms = () => async (dispatch, getState) => {
    try {
        const { _id } = getState().auth._faculties[0];
        const skip = getState().chat.rooms.length;

        // Step 1
        const rooms = await axios.get(
            `/api/rooms?facultyId=${_id}&skip=${skip}`
        );

        // Step 2
        dispatch({
            type: types.CHAT_ROOMS_SAVE,
            payload: rooms.data
        });
    } catch (err) {
        dispatch({
            type: types.ERROR,
            payload: 'Occurred an error while searching the list of chats'
        });
    }
};

/**
 * Save to Redux Store one or multiple global channels.
 * @param {string|Array<string>} channels
 */
const saveGlobalChannels = channels => dispatch => {
    if (Array.isArray(channels)) {
        channels.forEach(channel => {
            dispatch({
                type: types.CHAT_GLOBAL_CHANNELS_SAVE,
                payload: channel
            });
        });
    } else {
        dispatch({
            type: types.CHAT_GLOBAL_CHANNELS_SAVE,
            payload: channels
        });
    }
};

/**
 * When user selects/open a room, we do this:
 * 1. Unsubscribe the user from the PubNub channel of the previous
 * selected room & delete the previous room's channels and history.
 * 2. Fetch room's members details
 * 3. Save the new room and its most recent messages.
 * 4. Save room's channel & subscribe user to it.
 * 5. Update user metadata to alert other users which channel he is in.
 * @param {Object} room Room selected. We only use its id & history.
 */
const selectRoom = ({ _id, history }) => async (dispatch, getState) => {
    const { pubnub, selectedRoom, globalChannels } = getState().chat;

    try {
        // If the room is already selected, we don't do anything.
        if (selectedRoom.room._id !== _id) {
            dispatch(
                setChatStatusFetching('roomSelected', {
                    roomId: _id,
                    state: true
                })
            );

            // Step 1
            const { roomChannels } = selectedRoom;

            // Check if we have a room. This can be when we select a room
            // for the first time.
            if (roomChannels.length > 0) {
                // Unsubscribe the user from the channel of the previous room selected.
                unsubscribeFromChannels(pubnub, roomChannels);

                dispatch({
                    type: types.CHAT_ROOM_CHANNELS_RESET
                });

                dispatch({
                    type: types.CHAT_HISTORY_RESET,
                    payload: []
                });
            }

            // Step 2
            // Update the room (like: attributes) along with the details of each member.
            const response = await axios.get(
                `/api/rooms/${_id}?withData=["membersDetails"]`
            );
            let room = response.data;
            // We put the history (list of rooms have the histories) to the room fetched.
            room.history = history;

            // Step 3
            dispatch({
                type: types.CHAT_ROOM_SAVE,
                payload: room
            });

            // Save the messages of the new room to the history.
            dispatch({
                type: types.CHAT_HISTORY_SAVE,
                payload: room.history
            });

            // Step 4
            dispatch({
                type: types.CHAT_ROOM_CHANNELS_SAVE,
                payload: createUUID(
                    'room',
                    getState().chat.selectedRoom.room._id
                )
            });

            const newRoomChannels = getState().chat.selectedRoom.roomChannels;

            // Subscribe user to the new room's channel.
            subscribeToChannels(pubnub, newRoomChannels);

            // Step 5
            // Update which channels the user is.
            // await setState(
            setState(
                { whereNow: newRoomChannels[0] },
                pubnub,
                globalChannels.find(channel => channel.startsWith('faculty'))
            );

            dispatch(
                setChatStatusFetching('roomSelected', {
                    roomId: _id,
                    state: false
                })
            );
        }
    } catch (err) {
        console.error(err);
        dispatch(
            setChatStatusFetching('roomSelected', { roomId: _id, state: false })
        );

        dispatch({
            type: types.ERROR,
            payload: 'Occurred an error while selecting the chat room'
        });
    }
};

/**
 * We update a room of the rooms list with a new message.
 *
 * @param {string} roomId
 * @param {Object} message Message to add on room's history.
 */
const updateRoomsList = (roomId, message) => (dispatch, getState) => {
    // We have to wait until rooms list is updated if we previously
    // have added a new room.
    // More on: https://github.com/reduxjs/redux-thunk#composition
    return new Promise(async resolve => {
        // Check if the room is in the list, else fetch its data from Rooms Database.
        const { rooms } = getState().chat;

        if (rooms.some(room => room._id === roomId)) {
            dispatch({
                type: types.CHAT_ROOMS_UPDATE,
                payload: { roomId, message }
            });
        } else {
            // Get a room & save it to the Redux Store.
            try {
                const room = await axios.get(
                    `/api/rooms/${roomId}?withData=["lastMessages"]`
                );

                dispatch({
                    type: types.CHAT_ROOMS_ROOM_FETCH,
                    payload: room.data
                });
            } catch (err) {
                dispatch({
                    type: types.ERROR,
                    payload: 'Occurred an error while fetching a chat room'
                });
            }
        }

        resolve();
    });
};

/**
 * Fetch or create a new individual chat room if it doesn't
 * exist, based on chat's channel.
 * @param {string} clientUUID Eg: `clients#5c9f94ff134c8107b89cd242`.
 */
const fetchPublicClientRoom = clientUUID => async dispatch => {
    try {
        const room = await axios.get(
            `/api/public/rooms?member=${encodeURIComponent(clientUUID)}`
        );

        dispatch({
            type: types.CHAT_ROOM_SAVE,
            payload: room.data
        });
    } catch (err) {
        error(err, 'chatFatalError', dispatch);
    }
};

/**
 * Set attributes for the client on Client DB.
 *
 * @param {Object} attributes List of attribute to be saved. Can be: `email`.
 * @param {string} attributes[].email
 */
const setClientAttributes = attributes => async (dispatch, getState) => {
    try {
        const client = await axios.post(
            `/api/public/clients/${getState().client._id}/attributes`,
            { attributes }
        );

        // Set to default if there isn't any error.
        dispatch({
            type: types.ERROR_CLIENT_SET_ATTRIBUTE
        });

        dispatch({
            type: types.CLIENT_FETCH,
            payload: client.data
        });
    } catch (err) {
        dispatch({
            type: types.ERROR_CLIENT_SET_ATTRIBUTE,
            payload: 'email'
        });
    }
};

/**
 * Save the PubNub chat instance. This instance allows
 * to client and user to receive and send messages.
 *
 * @param {object} pubnub PubNub instance.
 */
const savePubnubInstance = pubnub => dispatch => {
    dispatch({
        type: types.CHAT_PUBNUB_SAVE,
        payload: pubnub
    });
};

/**
 * Save the PubNub channels of the chat room.
 * @param {string|Array<string>} channels
 */
const saveRoomChannels = channels => dispatch => {
    if (Array.isArray(channels)) {
        channels.forEach(channel => {
            dispatch({
                type: types.CHAT_ROOM_CHANNELS_SAVE,
                payload: channel
            });
        });
    } else {
        dispatch({
            type: types.CHAT_ROOM_CHANNELS_SAVE,
            payload: channels
        });
    }
};

/**
 * Set an attribute on Room DB and update the room.
 * @param {Object} attributes Attributes to be updated or added.
 */
const setRoomAttributes = attributes => async (dispatch, getState) => {
    try {
        const { room } = getState().chat.selectedRoom;

        // Only update/add the attributes if they have different values.
        if (_.isEqual(room.attributes, attributes) === false) {
            const roomUpdated = await axios.post(
                `/api/public/rooms/${room._id}/attributes`,
                {
                    attributes
                }
            );

            dispatch({
                type: types.CHAT_ROOM_ATTRIBUTES_UPDATE,
                payload: roomUpdated.data.attributes
            });
        }
    } catch (err) {
        console.error(err);

        dispatch({
            type: types.ERROR_CHAT_GENERAL,
            payload: `Chat settings don't changed`
        });
    }
};

/**
 * Save the message to database and then send it via PubNub.
 *
 * Steps:
 * 1. Save it to database on back-end. If it goes wrong, we dispatch an error.
 * 2. Send it via PubNub & check if the sending goes wrong.
 *
 * IMPORTANT: we don't save the message to Redux Store, because it
 * will be saved when it arrive to the PubNub listener.
 * @param {Object} message Message to save & send (it has to have the structure of the Message Database).
 * @param {Object} pubnub PubNub's instance to send the message to the channel.
 * @param {function} [resetChatInput] - Reset the text written by user/client on the Chat Input to empty.
 */
const saveAndSendMessage = (message, resetChatInput) => async (
    dispatch,
    getState
) => {
    await dispatch(saveMessageToDatabase(message, resetChatInput));

    // If there's an error on saving the message to database, we
    // stop. The sender will be alert (see errorReducer).
    if (
        _.isEmpty(getState().error.chatError.chatErrorMessageNotSavedToDatabase)
    ) {
        await dispatch(sendMessageViaPubnub(message));
    }
};

/**
 * Save the message to database and in Redux Store (to show it on the UI).
 * It can be used when:
 * - the bot sends to the receiver a message (the message isn't
 * on Database neither the receiver's local history == the Redux Store).
 * - when sender is the actual user/client and he sends a message
 * to other sender. Apart from sending, we have to save to DB and Redux Store.
 *
 * Steps:
 * 1. Validate and save the `message` to database.
 * 2. If it goes wrong, we dispatch the error as `true`.
 * 3. Reset the text of the chat input.
 * @param {Object} message It has to have the structure of the Message Database.
 * @param {function} [resetChatInput] - Reset the text written by user/client on the Chat Input to empty.
 */
const saveMessageToDatabase = (message, resetChatInput) => async (
    dispatch,
    getState
) => {
    try {
        // 1) Validate the message format before save to the Message Database.
        const { isValid, validationMessage } = isMessageValid(message);

        if (!isValid) throw Error(validationMessage);

        try {
            // Save the new message to database. If it isn't successfull,
            // we alert the user/client (look up the `catch`).
            await axios.post(
                `/api/public/rooms/${
                    getState().chat.selectedRoom.room._id
                }/messages/new`,
                message
            );

            // 2) Alert the client there's an error, else we won't do anything.
            dispatch({
                type: types.CHAT_STATUS_MESSAGE_SAVED_TO_DATABASE,
                payload: { isError: false, message }
            });

            // 3) Only reset the chat input if we pass the function in the parameters.
            if (typeof resetChatInput === 'function') resetChatInput();
        } catch (err) {
            dispatch({
                type: types.CHAT_STATUS_MESSAGE_SAVED_TO_DATABASE,
                payload: { isError: true, message }
            });
        }
    } catch (err) {
        error(err, 'chatFatalError', dispatch);
    }
};

/**
 * Save the message to Redux Store in `history`.
 * @param {Object} message
 */
const saveMessageToState = message => dispatch => {
    dispatch({
        type: types.CHAT_MESSAGE_SAVE,
        payload: message
    });
};

/**
 * Send it via PubNub through global channels + room channels & check
 * if the sending goes wrong (if true, we dispatch an error). For
 * testing mode, we also can send a goToBlock message if the message
 * contains this text "bot1234".
 * @param {Object} message - Message to send (it has to have the structure of the Message Database).
 */
const sendMessageViaPubnub = message => async (dispatch, getState) => {
    const { pubnub, globalChannels, selectedRoom } = getState().chat;
    const { roomChannels } = selectedRoom;

    // All channels where to publish the message.
    const channels = globalChannels.concat(roomChannels);

    // Send the message through PubNub. And check if PubNub has sent successfully the message.
    let { isError } = await sendMessage(message, pubnub, channels);

    // FOR DEBUG: alert Bot to do specific things.
    let result;
    if (message.data.type.text === 'bot1234') {
        result = await sendGoToBlocks(['hi'], pubnub, channels);
        isError = result.isError;
    } else if (message.data.type.text === 'person1234') {
        result = await sendGoToBlocks(['person'], pubnub, channels);
        isError = result.isError;
    }

    // Save the sending state of the message. This will be used
    // to show which message on UI PubNub hasn't sent.
    dispatch({
        type: types.CHAT_STATUS_MESSAGE_SEND,
        payload: { isError, message }
    });
};

/**
 * Send `goToBlock` message it via PubNub & check if the
 * sending goes wrong (if true, we dispatch an error).
 *
 * IMPORTANT: if the Quick Reply sent as a text message
 * (before sending the GoToBlock) had an error, we execute this action.
 *
 * @param {Array<string>} goToBlocks - Sender has clicked a Quick
 * Reply and wants to go to a block of information (a specific FAQ).
 * @param {Object} message - It has to have the structure of the Message Database.
 * @return {{isError: Promise<boolean>, validationMessage: Promise<string>}} If message has sent successfully, there isn't an error, else `isError`=`true`. We also return the validation message.
 */
const sendGoToBlocksViaPubnub = (goToBlocks, message) => async (
    dispatch,
    getState
) => {
    const { chat, error } = getState();
    const { chatErrorMessageNotSent } = error.chatError;
    const { pubnub, globalChannels, selectedRoom } = chat;
    const { roomChannels } = selectedRoom;

    // Check if we can send the Go to Blocks after we have sent
    // the Quick Reply clicked as a text message.
    if (
        !chatErrorMessageNotSent.find(
            item => JSON.stringify(message) === JSON.stringify(item)
        )
    ) {
        // All channels where to send the Go To Blocks.
        const channels = globalChannels.concat(roomChannels);

        // Send the message through PubNub. And check if PubNub
        // has sent successfully the message.
        const { isError } = await sendGoToBlocks(goToBlocks, pubnub, channels);

        // Save the sending state of the message. This will be
        // used to show which message on UI PubNub hasn't sent.
        dispatch({
            type: types.CHAT_STATUS_MESSAGE_SEND,
            payload: { isError, message }
        });
    }
};

/**
 * Fetch messages (on the room's database). We must wait for the
 * ChatEngine `$.connected` event before calling `Chat#search`.
 */
const fetchHistory = () => async (dispatch, getState) => {
    try {
        const { room, history } = getState().chat.selectedRoom;

        // Check if the history is initialized.
        const messages = await axios.get(
            `/api/public/rooms/${room._id}/messages?skip=${
                history !== null ? history.length : 0
            }`
        );

        dispatch({
            type: types.CHAT_HISTORY_FETCH,
            payload: messages.data
        });
    } catch (err) {
        error(err, 'chatFatalError', dispatch);
    }
};

/**
 * Save file to be sent.
 *
 * @param {Object} file
 * @param {string} file.original_filename Eg: 'admission june 2019'
 * @param {string} file.secure_url Full url.
 * @param {string} file.resource_type Can be: `raw` or `image` (Cloudinary consider PDF as image)
 * @param {string} file.public_id
 */
const saveAttachedFile = file => dispatch => {
    dispatch({
        type: types.CHAT_SAVE_ATTACHED_FILE,
        payload: file
    });
};

/**
 * Reset all attached files from chat's state. This is necessary when
 * the client/user wants to upload new files later and not the old ones.
 */
const deleteAllAttachedFiles = () => dispatch => {
    dispatch({
        type: types.CHAT_DELETE_ALL_ATTACHED_FILES
    });
};

const fetchAllQuestions = () => async dispatch => {
    try {
        const questions = await axios.get('/api/faqs/questions');

        dispatch({
            type: types.FAQS_QUESTIONS_FETCH_ALL,
            payload: questions.data
        });
    } catch (err) {
        console.error(err);

        dispatch({
            type: types.ERROR,
            payload: `Problem getting the list of all questions of FAQs`
        });
    }
};

/**
 * Save, modify or delete a set of questions on the database & Redux Store.
 * @param {Array} questions
 * @param {string} action Can be: `new`, `edit` or `delete`.
 */
const saveQuestions = (questions, action) => async dispatch => {
    try {
        if (action === 'new') {
            console.log('Added rows', questions);
            // dispatch({
            //     type: types.FAQS_QUESTIONS_NEW,
            //     payload: questions
            // })
        } else if (action === 'edit') {
            console.log('Edited rows', questions);
            const questionsEdited = await axios.post(
                `/api/faqs/questions/modify?action=${action}`,
                {
                    questions
                }
            );

            dispatch({
                type: types.FAQS_QUESTIONS_EDIT,
                payload: questionsEdited.data
            });
        } else if (action === 'delete') {
            console.log('Deleted rows', questions);
            // await axios.post(
            //     `/api/faqs/questions/modify?action=${action}`,
            //     questions
            // );
        }
    } catch (err) {
        console.error(err);

        dispatch({
            type: types.ERROR,
            payload: `Problem saving the questions of the FAQs`
        });
    }
};

// ================================================================
//          STATUS & ERRORS
// ================================================================
/**
 * Set an error to show on the UI.
 *
 * @param {string} err Message.
 */
const setError = err => dispatch => {
    dispatch({
        type: types.ERROR,
        payload: err
    });
};

/**
 * Stop the chat app.
 *
 * @param {boolean} err If there's an error `true`.
 */
const setChatFatalError = err => dispatch => {
    dispatch({
        type: types.ERROR_CHAT_FATAL,
        payload: err
    });
};

/**
 * Save the a new chat error.
 *
 * @param {string} err Error's explanation translated (it will be shown to the UI).
 */
const setChatErrorGeneral = err => async dispatch => {
    dispatch({
        type: types.ERROR_CHAT_GENERAL,
        payload: err
    });
};

/**
 * Set the main status of the chat, like network changes.
 *
 * More info on ChatStatus component: https://www.pubnub.com/docs/web-javascript/status-events
 *
 * @param {boolean} status If it's `true`, is online; else `false` (offline).
 */
const setChatStatus = status => dispatch => {
    dispatch({
        type: types.STATUS_CHAT_MAIN,
        payload: status
    });
};

/**
 * Set the fetching status of the chat.
 *
 * @param {string} id Which fetching property we want to change its state. Can be: `roomSelected`.
 * @param {*} value Any value of the propety that we want to set.
 */
const setChatStatusFetching = (id, value) => dispatch => {
    dispatch({
        type: types.STATUS_CHAT_FETCHING,
        id,
        value
    });
};

// ================================================================
//          COMPONENTS ACTIONS
// ================================================================
const handleComponentProfileDialog = () => dispatch => {
    dispatch({
        type: types.COMPONENT_PROFILE_DIALOG
    });
};
