import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import { withNamespaces } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';

import { isClientURL } from '../../../../../utils/utils';
import Text from './Text';
import QuickReplies from './QuickReplies';
import Image from './templates/Image';
import File from './templates/File';
import CaptureEmail from './templates/CaptureEmail';
import {
    fromNow,
    getDataFromUUID
} from '../../../../../utils/chat/messageUtils';

const styles = theme => ({
    quickReplies: {
        marginTop: 20
    },
    messageFrame: {
        width: 'max-content',
        marginTop: '2px',
        [theme.breakpoints.down('sm')]: {
            maxWidth: '75%'
        },
        [theme.breakpoints.up('sm')]: {
            maxWidth: '60%'
        }
    },
    messageFrameLeft: {
        marginLeft: 20,
        [theme.breakpoints.down('sm')]: {
            marginLeft: 10
        }
    },
    messageFrameRight: {
        // Align the only right message to the right side of the column.
        alignSelf: 'flex-end',
        marginRight: 20,
        [theme.breakpoints.down('sm')]: {
            marginRight: 10
        }
    },
    text: theme.chat.message.text.main,
    textLeft: theme.chat.message.text.left,
    textRight: theme.chat.message.text.right,
    fileLeft: theme.chat.message.file.left,
    fileRight: theme.chat.message.file.right,
    imageTheme: theme.chat.message.image,
    image: {
        // Crop the borders of the image and limit it by borders of the parent container.
        overflow: 'hidden'
    }
});

/**
 * @class Render different types of messages:
 * - simple text with some markdown (eg: bold, links...)
 * - quick replies
 * - file
 * - image
 *
 * We style here each type of message.
 * We also deal with the logic of putting the message to the left or right side. TIP: the Quick Replies component always goes to the center (not left neither right).
 */
class Message extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timetoken: '',
            side: '' // It can only be: 'Left' or 'Right'.
        };

        this.renderText = this.renderText.bind(this);
        this.renderImage = this.renderImage.bind(this);
        this.renderFile = this.renderFile.bind(this);
        this.renderTemplateCaptureEmail = this.renderTemplateCaptureEmail.bind(
            this
        );
        this.updateTime = this.updateTime.bind(this);
        this.getTimeAndSender = this.getTimeAndSender.bind(this);
    }

    /**
     * Define which side (left or right) the message will be.
     *
     * 2 steps:
     *      1) check if the actual chat is from public web (for clients)
     * or faculty private web (for users).
     *      2) If it's a client, the right messages their sender is the client.
     * Else, the sender is the bot or the same user (not others users).
     *
     */
    componentDidMount() {
        const { side } = this.state;
        const { auth, client, message } = this.props;
        const { type, id } = getDataFromUUID(message.sender);
        let messageSide = '';

        // Step 1
        if (isClientURL()) {
            if (id === client._id) messageSide = 'Right';
            else messageSide = 'Left';
        } else {
            // Step 2
            if (type === 'bot' || id === auth._id) messageSide = 'Right';
            else messageSide = 'Left';
        }

        // Only change the local state if it's different from the
        // message we're rendering. This is more performing than
        // using `setState` every time we render a new message.
        if (side !== messageSide) this.setState({ side: messageSide });
    }

    /**
     * Render the text. The style of this message changes if
     * it goes to the right or left side.
     *
     * @return DOM element.
     */
    renderText() {
        const { side } = this.state;
        const { message, classes } = this.props;
        const { text } = message.data.type;

        return (
            <div className={classNames(classes.text, classes[`text${side}`])}>
                <Text text={text} />
            </div>
        );
    }

    /**
     * Render the image.
     *
     * @return DOM element.
     */
    renderImage() {
        const { message, classes } = this.props;
        const { payload } = message.data.type.attachment;

        return (
            <div className={classNames(classes.imageTheme, classes.image)}>
                <Image image={payload} />
            </div>
        );
    }

    /**
     * Render the file. The style of this message changes if
     * it goes to the right or left side.
     *
     * @return DOM element.
     */
    renderFile() {
        const { side } = this.state;
        const { message, classes } = this.props;
        const { payload } = message.data.type.attachment;

        return (
            <div
                className={classNames(
                    classes.text,
                    classes[`text${side}`],
                    classes[`file${side}`]
                )}
            >
                <File file={payload} />
            </div>
        );
    }

    /**
     * Render the template Email to capture the email.
     *
     * @return DOM element.
     */
    renderTemplateCaptureEmail() {
        const { side } = this.state;
        const { classes } = this.props;

        return (
            <div className={classNames(classes.text, classes[`text${side}`])}>
                <CaptureEmail />
            </div>
        );
    }

    /**
     * Update the message's time state when the user hovers on the message.
     */
    updateTime() {
        const timetokenUpdated = fromNow.prettierExtend(
            this.props.message.timetoken
        );
        this.setState({ timetoken: timetokenUpdated });
    }

    /**
     * Return a string according to: message's side, message's time, sender type & sender's name.
     *
     * @return {string} Time with sender's id.
     */
    getTimeAndSender() {
        const { timetoken, side } = this.state;
        const { message, t } = this.props;
        const { sender } = message;

        const { type, id } = getDataFromUUID(sender);

        if (side === 'Left') {
            if (type === 'bot') {
                return `${timetoken} - Au`;
            } else {
                if (type === 'client')
                    return `${timetoken} - ${t('item.message-sender-client')}`;
                else if (type === 'user')
                    return `${timetoken} - ${t(
                        'item.message-sender-user'
                    )} ${id}`;
            }
        } else {
            if (type === 'bot') return `${timetoken} - Au`;
            else return timetoken;
        }
    }

    render() {
        const { side } = this.state;
        const { message, classes } = this.props;
        const { type } = message.data;

        // Render all type of messages to the left or right side (it
        // depends if sender is also the message's sender).
        // We only don't show the Tooltip for the QuickReplies component.
        if (type.quickReplies)
            return (
                <div className={classes.quickReplies}>
                    <QuickReplies bubbles={type.quickReplies} />
                </div>
            );
        else
            return (
                <div
                    className={classNames(
                        classes.messageFrame,
                        classes[`messageFrame${side}`]
                    )}
                >
                    <Tooltip
                        placement={side === 'Left' ? 'top-start' : 'top-end'}
                        disableFocusListener
                        onOpen={this.updateTime}
                        title={this.getTimeAndSender()}
                    >
                        {// Conditional ternary operator
                        type.text
                            ? this.renderText()
                            : type.attachment &&
                              type.attachment.type === 'image'
                            ? this.renderImage()
                            : type.attachment && type.attachment.type === 'file'
                            ? this.renderFile()
                            : type.attachment &&
                              type.attachment.type === 'template' &&
                              type.attachment.payload.templateType === 'email'
                            ? this.renderTemplateCaptureEmail()
                            : null}
                    </Tooltip>
                </div>
            );
    }
}

function mapStateToProps({ auth, client }) {
    return { auth, client };
}

const enhancer = compose(
    connect(mapStateToProps),
    withNamespaces(['chatList']),
    withStyles(styles)
);

Message.propTypes = {
    message: PropTypes.object.isRequired
};

export default enhancer(Message);
