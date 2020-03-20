import _ from 'lodash';
import produce from 'immer';

import * as types from '../actions/types';
import {
    addNewMessage,
    addOlderMessages,
    isDuplicatedMessage
} from '../utils/chat/messageUtils';

const initialState = {
    // PubNub's instance of the user/client (every user
    // & client has a PubNub's with his unique UUID). To get the
    // UUID call `pubnub.getUUID()`.
    pubnub: {},
    // Chat rooms ordered according to the newest message.
    // IMPORTANT: Each one contains all history of messages, they
    // are order from newest (first element) to oldest.
    rooms: [],
    // Status to know if there more rooms to be fetched on the chats list.
    hasMoreRooms: false,
    // At this version, it will be 1 channel: the faculty's channel used
    // to alert users when there're incoming messages
    // For users: publish and suscribe via PubNub to faculty's channel
    // For clients: publish via PubNub to faculty's channel.
    // IMPORTANT: They're the only channels where we store the history permanently.
    globalChannels: [],
    selectedRoom: {
        // Room's data from database.
        room: {},
        // PubNub channels where user and client receive and send messages to each other.
        // At this version, it will be 1 channel: client or user's channels of the selected room.
        // For users & clients: publish and suscribe via PubNub.
        roomChannels: [],
        // All messages that are ordered from the newest (first element) to the oldeest.
        history: null,
        // Status to know if there more older messages to be fetched on the history.
        hasMoreMessages: false,
        // Buffer where we save temporaly the files to be sent or deleted (if we cancel their sending).
        attachedFiles: []
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case types.CHAT_ROOMS_SAVE:
            return produce(state, draft => {
                const newRooms = action.payload;
                // Check if there're more rooms on the database to be fetched.
                // This limit has to be the same as on the back-end Room API.
                if (newRooms.length === 10) draft.hasMoreRooms = true;
                else draft.hasMoreRooms = false;

                newRooms.forEach(room => {
                    draft.rooms.push(room);
                });
            });
        case types.CHAT_ROOMS_UPDATE:
            return produce(state, draft => {
                const { roomId, message } = action.payload;
                // Copy the reference of the array `rooms`.
                let { rooms } = draft;
                const index = rooms.findIndex(room => room._id === roomId);

                if (index !== -1) {
                    let roomFound = rooms[index];
                    roomFound.history = addNewMessage(
                        roomFound.history,
                        message
                    );

                    // Reorder the rooms as the ones which has the last message is the most recent to the oldest.
                    // Only we do it if the room isn't on the first position.
                    if (index > 0) {
                        // Remove the updated room in rooms[].
                        rooms.splice(index, 1);

                        // And add it at the beginning of array rooms.
                        rooms.unshift(roomFound);
                    }
                } else
                    console.error(
                        `RoomId=${roomId} not found on rooms. We can't add the new message=${JSON.stringify(
                            message
                        )}`
                    );
            });
        case types.CHAT_ROOMS_ROOM_FETCH:
            return produce(state, draft => {
                draft.rooms.unshift(action.payload);
            });
        case types.CHAT_PUBNUB_SAVE:
            return Object.assign({}, state, {
                pubnub: action.payload
            });
        case types.CHAT_GLOBAL_CHANNELS_SAVE:
            return produce(state, draft => {
                draft.globalChannels.push(action.payload);
            });
        case types.CHAT_ROOM_SAVE:
            return produce(state, draft => {
                draft.selectedRoom.room = action.payload;
            });
        case types.CHAT_ROOM_ATTRIBUTES_UPDATE:
            return produce(state, draft => {
                draft.selectedRoom.room.attributes = action.payload;
            });
        case types.CHAT_ROOM_CHANNELS_SAVE:
            return produce(state, draft => {
                draft.selectedRoom.roomChannels.push(action.payload);
            });
        case types.CHAT_ROOM_CHANNELS_RESET:
            return produce(state, draft => {
                draft.selectedRoom.roomChannels = [];
            });
        case types.CHAT_HISTORY_FETCH:
            return produce(state, draft => {
                let room = draft.selectedRoom;

                if (room.history === null) room.history = [];

                // Save the messages to the selected room.
                room.history = addOlderMessages(room.history, action.payload);

                // Check if there're more older message on database to be fetched.
                // This limit has to be the same as on the back-end Message API.
                if (action.payload.length === 30)
                    draft.selectedRoom.hasMoreMessages = true;
                else draft.selectedRoom.hasMoreMessages = false;
            });
        case types.CHAT_HISTORY_SAVE:
            return produce(state, draft => {
                let room = draft.selectedRoom;

                if (room.history === null) room.history = [];

                // Save the messages to the selected room.
                room.history = action.payload;

                // Alert if there's more messages to be fetched on
                // the on the back-end Message API.
                // True if there're 30, 60, 90... messages (multiple
                // of 30), we mark as there're are more messages to be fetched.
                if (Number.isInteger(action.payload.length / 30))
                    draft.selectedRoom.hasMoreMessages = true;
                else draft.selectedRoom.hasMoreMessages = false;
            });
        case types.CHAT_HISTORY_RESET:
            return produce(state, draft => {
                draft.selectedRoom.history = [];
                draft.selectedRoom.hasMoreMessages = false;
            });
        case types.CHAT_MESSAGE_SAVE:
            return produce(state, draft => {
                let { history } = draft.selectedRoom;

                // Save the message if the new one isn't duplicated (eg: the client
                // has multiple browser sessions opened).
                if (
                    isDuplicatedMessage(
                        history.length < 20
                            ? history.slice()
                            : history.slice(0, 20),
                        action.payload
                    ) === false
                )
                    history = addNewMessage(history, action.payload);
            });
        case types.CHAT_SAVE_ATTACHED_FILE:
            return produce(state, draft => {
                let { attachedFiles } = draft.selectedRoom;
                attachedFiles.push(action.payload);
            });
        case types.CHAT_DELETE_ALL_ATTACHED_FILES:
            return produce(state, draft => {
                draft.selectedRoom.attachedFiles = [];
            });
        default:
            return state;
    }
};

// DRAFTs
/**
 * All the channels the client/user is in them.
 * Minimum every client has 2 channels and 3 the user:
 *      1) channel of the one conversation where there's `history`.
 *      2) channel of the one conversation where we put the message to `update/delete`. This allows to know which message from channel `history` show and not.
 *      3) Inbound channel for `user` (only for faculty's user, because have a lot of open conversations) where he receives communication from other clients, faculty's users and bot. This prevent to fetch history of every conversation that he's in.
 *
 * More info about update/delete side channel pattern: https://www.pubnub.com/docs/web-javascript/message-update-delete#side-channel.
 * More info about inbound channel pattern: https://www.pubnub.com/docs/web-javascript/inbound-channel-pattern.
 */
