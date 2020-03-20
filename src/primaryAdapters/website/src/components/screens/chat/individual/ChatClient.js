import _ from 'lodash';
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import * as actions from '../../../../actions';
import pubnubInit, { subscribeToChannels } from '../../../../utils/chat/pubnub';
import { createUUID } from '../../../../utils/chat/chatUtils';
import IndividualChatFrame from './ChatIndividualFrame';
import Error from './ChatError';
import ChatStatus from './ChatStatus';

const styles = theme => ({
    chatClient: {
        // Don't follow height & width of parent components.
        position: 'absolute',
        width: '100%',
        height: '100%'
    }
});

/**
 * @class Chat that is public for web visitors to chat with the bot and
 * the members of the faculty.
 */
class ChatClient extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * Fetch the client or create it if it hasn't any cookie associated to him.
     */
    componentDidMount() {
        const { location, fetchClient } = this.props;

        // Extract the query paramater from the URL
        const facultyId = new URLSearchParams(location.search).get('facultyId');

        // Fetch the client to the database;
        fetchClient(facultyId);
    }

    /**
     * Steps:
     * 1. Fetch client's chat room. If the client hasn't got any room
     * associated, we create a new room to the database only if the
     * client data is available. Then initialize the client's PubNub instance.
     * 2. Create one channel for the client and subscribe to it.
     * Then save this channel & the faculty channel (where we alert
     * the users of the incoming messages)
     */
    componentDidUpdate(prevProps) {
        const {
            client,
            room,
            location,
            fetchPublicClientRoom,
            savePubnubInstance,
            saveGlobalChannels,
            saveRoomChannels,
            fetchHistory
        } = this.props;

        // Step 1
        if (
            _.isEmpty(prevProps.client) === true &&
            _.isEmpty(client) === false
        ) {
            // Create a PubNub UUID for the client.
            const clientUUID = createUUID('client', client._id);
            // PubNub instance.
            const pubnub = pubnubInit(clientUUID);

            // Save PubNub information on Redux Store.
            savePubnubInstance(pubnub, clientUUID);

            // Fetch a room where the client is a member. If it's the first
            // time the client interacts with app, then we create a new room.
            fetchPublicClientRoom(clientUUID);
        }

        // Step 2
        if (_.isEmpty(prevProps.room) && !_.isEmpty(room)) {
            const { pubnub } = this.props;

            // Create a channel where client & bot will send and receive messages.
            const roomChannel = createUUID('room', room._id);

            // Client will listen only one channel where he will send & receive the messages.
            subscribeToChannels(pubnub, roomChannel);

            // Save name of the channels to Redux Store.
            saveRoomChannels(roomChannel);

            // Save the chat room channels to the Redux Store. These
            // will be used to send messages.
            const facultyChannel = createUUID(
                'faculty',
                new URLSearchParams(location.search).get('facultyId')
            );

            saveGlobalChannels(facultyChannel);

            fetchHistory();
        }
    }

    render() {
        const {
            generalError,
            chatFatalError,
            client,
            room,
            history,
            classes
        } = this.props;

        if (generalError || chatFatalError) return <Error />;
        // Don't enable the chat UI when: the client, the selected chat room & the history of the selectred room are processed.
        else if (_.isEmpty(client) || _.isEmpty(room) || history === null) {
            return <div>Setting the web 🌐...</div>;
        } else {
            return (
                <div className={classes.chatClient}>
                    <IndividualChatFrame />
                    <ChatStatus />
                </div>
            );
        }
    }
}

function mapStateToProps({ client, chat, error }) {
    const { pubnub, selectedRoom } = chat;
    const { room, history } = selectedRoom;
    const { generalError, chatError } = error;
    const { chatFatalError } = chatError;
    return {
        generalError,
        chatFatalError,
        client,
        pubnub,
        room,
        history
    };
}

const enhancer = compose(
    withRouter,
    connect(
        mapStateToProps,
        actions
    ),
    withStyles(styles)
);
export default enhancer(ChatClient);
