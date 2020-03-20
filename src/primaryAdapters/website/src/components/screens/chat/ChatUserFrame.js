import _ from 'lodash';
import React, { Component, Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Switch, Route, Redirect } from 'react-router';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Hidden from '@material-ui/core/Hidden';
import { fade } from '@material-ui/core/styles/colorManipulator';

import ROUTES from '../../../utils/routes';
import * as actions from '../../../actions';
import pubnubInit, { subscribeToChannels } from '../../../utils/chat/pubnub';
import { createUUID } from '../../../utils/chat/chatUtils';
import ChatListFrame from './list/ChatListFrame';
import ChatIndividualFrame from './individual/ChatIndividualFrame';
import Profile from './profile/Profile';

const styles = theme => ({
    chatFrame: {
        height: '100%'
    },
    columns: {
        // Height is necessary for shrink the Infinite Scroll components. Else, scroll doesn't work.
        height: '100%',
        display: 'flex'
    },
    columnTheme: {
        borderLeftStyle: 'solid',
        borderLeftWidth: 2,
        borderLeftColor: fade(theme.palette.primary.main, 0.07)
    },
    twoColumnsLeft: {
        // It's 39% (and not 40%) because of we want to prevent horizontal
        // scroll of the Chat Frame component with the remaining 1%.
        minWidth: '39%'
    },
    twoColumnRight: {
        // It's necessary to fit the chat content.
        minWidth: '60%',
        // Height is necessary for shrink the Infinite Scroll components. Else, scroll doesn't work.
        height: '100%',
        // Fit the remaining horizontal pixels.
        flexGrow: 1
    },
    twoColumnRightBar: {
        backgroundColor: theme.palette.primary.main,
        flexGrow: 1
    },
    threeColumnsList: {
        width: '25%'
    },
    threeColumnsChat: {
        width: '50%'
    },
    appBarTheme: theme.components.appBar.shadow
});

/**
 * @class It does 2 main things:
 * 1. rendering of the responsive UI for chat: list of chats, individual
 * chat & client's profile.
 * 2. Initilization of user's PubNub instance to be able to send & receive
 * messages.
 */
class ChatFrame extends Component {
    constructor(props) {
        super(props);

        this.renderOneColumn = this.renderOneColumn.bind(this);
        this.renderTwoColumns = this.renderTwoColumns.bind(this);
        this.renderThreeColumns = this.renderThreeColumns.bind(this);
    }

    /**
     * Initilize PubNub's instance.
     */
    componentDidMount() {
        const {
            auth,
            savePubnubInstance,
            saveGlobalChannels,
            fetchRooms,
            updateRoomsList
        } = this.props;
        // Unique client's uuid. This uuid effects the working on Message
        // Routes API, for this reason it has to be:
        // `<type of sender:clients or users>#<sender's id>`
        const userUUID = createUUID('user', auth._id);

        // PubNub instance.
        const pubnub = pubnubInit(userUUID);

        // Save PubNub information on Redux Store.
        savePubnubInstance(pubnub, userUUID);

        /**
         * PubNub's events handler. We listen the incoming message from all rooms via faculty channel.
         *
         * IMPORTANT: Listeners have to be added before calling the method.
         *
         * More info on: https://www.pubnub.com/docs/web-javascript/api-reference-publish-and-subscribe#listeners
         */
        pubnub.addListener({
            /**
             * Message handler of all the channels where the user is subscribed.
             *
             * More on: https://www.pubnub.com/docs/web-javascript/api-reference-publish-and-subscribe#subscribe-message-response
             *
             * @param {Object} m Message data.
             * @param {string} m.channel The channel name for which the message belongs.
             * @param {string} m.subscription The channel group or wildcard subscription match (if exists).
             * @param {string} m.timetoken Publish timetoken.
             * @param {Object} m.message The payload.
             * @param {Object} m.publisher The publisher.
             */
            message: async m => {
                const { channel, message } = m;

                // Update a room of the room list when the global channel "faculties#..." has a new incoming message of that room.
                if (channel.startsWith('faculty')) {
                    console.log('PubNub Message received', message);
                    if (
                        message.data &&
                        message.data.type &&
                        (message.data.type.hasOwnProperty('text') ||
                            message.data.type.hasOwnProperty('quickReplies') ||
                            message.data.type.hasOwnProperty('attachment'))
                    ) {
                        console.log(
                            'ChatUserFrame - Pubnub message received',
                            m
                        );
                        await updateRoomsList(message.roomId, message);
                    }

                    if (message.event && message.event.messageSeen) {
                        console.log('Message Seen ', message.event.messageSeen);
                    }
                }
            },
            /**
             * Handle presence of all the channels where the user is subscribed.
             *
             * More on https://www.pubnub.com/docs/web-javascript/presence
             *
             * @param {Object} p Presence data.
             * @param {string} p.action Can be `join`, `leave`, `state-change`,
             * `timeout` or `interval`.
             * @param {string} [p.action="join"] A user subscribes to channel.
             * @param {string} [p.action="leave"] A user unsubscribes from channel.
             * @param {string} [p.action="timeout"] A `timeout` event is fired when a connection to a channel is severed and the subscriber has not been seen in 320 seconds (just over 5 minutes). It can be customized using the SDK.
             * @param {string} [p.action="state-change"] A state-change event will be
             * fired anytime the state is changed using the state API.
             * @param {string} [p.action="interval"] An occupancy count is sent
             * every 10 seconds (the default setting, it's configurable.
             * @param {string} p.channel The channel for which the message belongs.
             * @param {number} p.occupancy Number of users connected with the channel.
             * @param {Object} p.state User State.
             * @param {string} p.subscription The channel group or wildcard
             * subscription match (if exists).
             * @param {number} p.timestamp Publish timetoken.
             * @param {string} p.timetoken Current timetoken.
             * @param {Array} p.uuid UUIDs of users who are connected with the channel.
             * @param {Object} p.data JSON Object, which contains any custom state information.
             */
            presence: p => {
                // console.log('Presence', p);
                // const { channel, uuid, action } = p;
                // if (
                //     //channel.startsWith('room') &&
                //     action === 'join' ||
                //     action === 'leave' ||
                //     action === 'timeout'
                // ) {
                // console.log('Action ' + action + '. Channel ' + channel);
                // updateUsersOnline(uuid, action);
                // }
            },
            status: s => {
                // console.log('Status', s);
            }
        });

        // Clear all subscriptions if the user is subscribed to someone.
        //pubnub.unsubscribeAll();

        const facultyChannel = createUUID('faculty', auth._faculties[0]._id);

        // User will listen one channel where will be alert of the
        // incoming message of all rooms.
        subscribeToChannels(pubnub, facultyChannel);

        saveGlobalChannels(facultyChannel);

        // Get & save the most recent rooms & save the most recent room as
        // the selected room.
        fetchRooms();
    }

    /**
     * Render List of Chats, Individual Chat & Profile for extra small screens.
     */
    renderOneColumn() {
        const { room, fetching } = this.props;

        return (
            <Fragment>
                <Switch>
                    <Route exact path={ROUTES.chatUser.path}>
                        <ChatListFrame />
                        {this.p}
                    </Route>
                    <Route exact path={ROUTES.chatUserIndividual.path}>
                        <ChatIndividualFrame />
                        <Profile />
                        {// If there isn't any room selected & any room is selected from the list, we redirect to the chats list.
                        _.isEmpty(room) &&
                        fetching.every(
                            el =>
                                el.id === 'roomSelected' &&
                                el.value.state === false
                        ) ? (
                            <Redirect to={ROUTES.chatUser.path} />
                        ) : null}
                    </Route>
                </Switch>
            </Fragment>
        );
    }

    /**
     * Render List of Chats, Individual Chat & Profile for small screens.
     */
    renderTwoColumns() {
        const { classes } = this.props;

        return (
            <div className={classes.columns}>
                <div className={classes.twoColumnsLeft}>
                    <ChatListFrame />
                </div>
                <div
                    className={classNames(
                        classes.columnTheme,
                        classes.twoColumnRight
                    )}
                >
                    <ChatIndividualFrame />
                    <Profile />
                </div>
            </div>
        );
    }

    /**
     * Render List of Chats, Individual Chat & Profile for medium and larger screens.
     */
    renderThreeColumns() {
        const { classes } = this.props;

        return (
            <div className={classes.columns}>
                <div className={classes.threeColumnsList}>
                    <ChatListFrame />
                </div>
                <div
                    className={classNames(
                        classes.columnTheme,
                        classes.threeColumnsChat
                    )}
                >
                    <ChatIndividualFrame />
                </div>
                <div className={classes.columnTheme}>
                    <Profile />
                </div>
            </div>
        );
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.chatFrame}>
                <Hidden only={['sm', 'md', 'lg', 'xl']}>
                    {this.renderOneColumn()}
                </Hidden>
                <Hidden only={['xs', 'md', 'lg', 'xl']}>
                    {this.renderTwoColumns()}
                    {/* When the screen was XS and renders as SM, then we redirect. */}
                    <Switch>
                        <Route exact path={ROUTES.chatUserIndividual.path}>
                            <Redirect to={ROUTES.chatUser.path} />
                        </Route>
                    </Switch>
                </Hidden>
                <Hidden only={['xs', 'sm']}>
                    {this.renderThreeColumns()}
                    {/* When the screen was XS and renders as MD..., then we redirect. */}
                    <Switch>
                        <Route exact path={ROUTES.chatUserIndividual.path}>
                            <Redirect to={ROUTES.chatUser.path} />
                        </Route>
                    </Switch>
                </Hidden>
            </div>
        );
    }
}

function mapStateToProps({ auth, chat, status }) {
    const { globalChannels, rooms, selectedRoom } = chat;
    const { room } = selectedRoom;
    const { fetching } = status.chatStatus;

    return { auth, globalChannels, rooms, room, fetching };
}

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withRouter,
    withStyles(styles)
);

export default enhancer(ChatFrame);
