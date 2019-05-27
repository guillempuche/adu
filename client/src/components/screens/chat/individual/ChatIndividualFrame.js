import _ from 'lodash';
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import { formValueSelector } from 'redux-form';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import * as actions from '../../../../actions';
import botInit from '../../../../utils/chat/bot';
import { sendEvent } from '../../../../utils/chat/pubnub';
import {
    createMessage,
    getFileExtension
} from '../../../../utils/chat/messageUtils';
import { isClientURL } from '../../../../utils/utils';
import ChatContent from './content/ChatContent';
import ChatInput from './input/ChatInput';

const styles = theme => ({
    helperText: {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    individualChatFrame: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    content: {
        flexGrow: 1,
        overflowX: 'hidden'
    }
});

/**
 * @class This component is used for Client & Users UI.
 * It does these things:
 * - Listen PubNub messages.
 * - Save chat messages (text, attachments...) to the Redux Store to be print on UI.
 * - Set the UI chat for clients & users. Eg: show chat content & chat input, deal with attached files...
 */
class ChatIndividualFrame extends React.Component {
    constructor(props) {
        super(props);

        this.sendChat = this.sendChat.bind(this);
    }

    /**
     * Individual chat logic for users & clients.
     *
     * Steps:
     * 1. Add PubNub listeners to handle all incoming messages of the PubNub's channel.
     * 2. Initialize the bot.
     */
    componentDidMount() {
        const {
            pubnub,
            globalChannels,
            setChatStatus,
            saveMessageToState,
            setRoomAttributes,
            setChatErrorGeneral
        } = this.props;

        try {
            if (isClientURL()) {
                // STEP 1
                /**
                 * PubNub's events handler. We can be notified of `message`, `presence`, connectivity on `status`, notifications via the listeners. It can only be these 3 types: `message`, `status` and `presence`.
                 *
                 * IMPORTANT: Listeners have to be added before calling the method. For now, we don't follow this rule.
                 *
                 * More info on: https://www.pubnub.com/docs/web-javascript/api-reference-publish-and-subscribe#listeners
                 */
                pubnub.addListener({
                    /**
                     * Message handler.
                     *
                     * IMPORTANT: Before sending the message, it has to be validated (on Message Utils)
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
                        const { channel, message, publisher } = m;

                        // Only when the message is a text, quick replies or
                        // attachments) and when its channel is the same
                        // as the channel of the actual selected room.
                        if (
                            channel.startsWith('room') &&
                            this.props.roomChannels.some(
                                roomChannel => channel === roomChannel
                            ) &&
                            _.isEmpty(message.data) === false &&
                            _.isEmpty(message.data.type) === false &&
                            (message.data.type.hasOwnProperty('text') ||
                                message.data.type.hasOwnProperty(
                                    'quickReplies'
                                ) ||
                                message.data.type.hasOwnProperty('attachment'))
                        ) {
                            // Print the message on the UI.
                            // When PubNub receives this message, the message is
                            // already on the Message Database.
                            saveMessageToState(message);

                            // Only for users.
                            if (!isClientURL()) {
                                // // The user who sees this message, he broadcasts to other
                                // // user notifying the message has been seen.
                                // console.log(message.timetoken);
                                // await sendEvent(
                                //     { messageSeen: message.timetoken },
                                //     pubnub,
                                //     globalChannels.find(channel =>
                                //         channel.startsWith('faculty')
                                //     )
                                // );
                            }
                        }
                        // Bot sends this event: it indicates the client wants to talk to a person of the faculty.
                        else if (
                            message.event === 'stoppedFAQs' &&
                            publisher === pubnub.getUUID()
                        ) {
                            // Set the stoppepFAQs with the current time in milliseconds (as a type of Number).
                            await setRoomAttributes({
                                stoppedFAQs: moment().valueOf()
                            });
                        }
                    },
                    /**
                     * Status response.
                     *
                     * More on: https://www.pubnub.com/docs/web-javascript/api-reference-publish-and-subscribe#listeners
                     *
                     * @param {Object} s Status response.
                     * @param {Array} s.category Status events.
                     * @param {Array} s.affectedChannelGroups The channels groups affected in the operation.
                     * @param {Array} s.affectedChannels The channels affected in the operation.
                     * @param {Array} s.operation Name of the operation.
                     */
                    status: s => {
                        setChatStatus(s.category);
                    }
                });
            }

            if (isClientURL()) botInit();
        } catch (err) {
            console.error(err);
            setChatErrorGeneral(true);
        }
    }

    /**
     * Send a text message or attachments to the other users.
     */
    async sendChat() {
        /**
         * @typedef {Function} reset - Reset text of the Chat Input
         * (prop passed by Redux Form).
         */
        const {
            pubnub,
            room,
            attachedFiles,
            chatInputText,
            saveAndSendMessage,
            reset
        } = this.props;

        let message = {},
            content = {};

        // Prioritize the sending of attachments. The client only can
        // send the text input when there aren't any files.
        if (attachedFiles.length === 0) {
            // Only send the text message when the Chat Input isn't empty.
            if (chatInputText) {
                content = { text: chatInputText };

                message = createMessage(room._id, content, pubnub);

                await saveAndSendMessage(message, reset);
            }
        } else {
            // We merge with message data every file attached.
            function joinAttachToMessage({
                resource_type,
                secure_url,
                original_filename
            }) {
                const fileExtension = getFileExtension(secure_url);

                content = {
                    attachment: {
                        type:
                            // The CDN Cloudinary saves the PDF files as a
                            // resource_type='image', then we have to know
                            // if the image is a PDF or another extension (eg: jpg).
                            resource_type === 'raw' || fileExtension === 'pdf'
                                ? 'file'
                                : 'image',
                        payload: {
                            fileName: original_filename,
                            url: secure_url
                        }
                    }
                };

                return createMessage(room._id, content, pubnub);
            }

            // If client attachs an multiples files, we send each one
            // seperately.
            attachedFiles.forEach((el, index) => {
                // Create a recursive delay because database maybe doesn't save all messages.
                setTimeout(async () => {
                    await saveAndSendMessage(joinAttachToMessage(el));
                }, 200 * index);
            });
        }
    }

    render() {
        const { room, fetching, classes, t } = this.props;

        if (
            fetching.some(
                el => el.id === 'roomSelected' && el.value.state === true
            )
        ) {
            return (
                <div className={classes.helperText}>
                    <CircularProgress />
                </div>
            );
        }

        // Only works for the users. The clients already have the their rooms fetched.
        if (_.isEmpty(room)) {
            return (
                <div className={classes.helperText}>
                    <Typography variant="body1">
                        {t('list.text-select-chat')}
                    </Typography>
                </div>
            );
        } else
            return (
                <div className={classes.individualChatFrame}>
                    <div className={classes.content}>
                        <ChatContent />
                    </div>
                    <div>
                        <ChatInput onSend={this.sendChat} />
                    </div>
                </div>
            );
    }
}

function mapStateToProps(state) {
    const { status, chat } = state;
    const { fetching } = status.chatStatus;
    const { selectedRoom, pubnub, globalChannels } = chat;
    const { room, roomChannels, attachedFiles } = selectedRoom;

    return {
        fetching,
        pubnub,
        globalChannels,
        room,
        roomChannels,
        attachedFiles,
        chatInputText: formValueSelector('chatInputForm')(state, 'text')
    };
}

const enhancer = compose(
    // Redux Form passes the 'reset()' to props;
    reduxForm({ form: 'chatInputForm' }),
    connect(
        mapStateToProps,
        actions
    ),
    withNamespaces('chatList'),
    withStyles(styles)
);
export default enhancer(ChatIndividualFrame);
