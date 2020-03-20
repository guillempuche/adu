import classNames from 'classnames';
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../../../../../actions';
import PropTypes from 'prop-types';
import i18next from 'i18next';
import { withStyles } from '@material-ui/core';
import ButtonBase from '@material-ui/core/ButtonBase';

import { createMessage } from '../../../../../utils/chat/messageUtils';
import { isClientURL } from '../../../../../utils/utils';

const styles = theme => ({
    quickReplies: {
        // Create a flexblox for all the quick replies.
        display: 'flex',
        flexDirection: 'row',
        //justifyContent: 'center',
        overflowX: 'auto',
        // Not wrap the text of each Quick Reply.
        whiteSpace: 'nowrap',
        // Center the Quick Replies when they haven't overflow, else
        // they are positioned at the beginning of the container.
        // TIP: We can't use justify-content=center because when
        // there's an overflow of Quick Replies, all of them aren't shown.
        '&::before': {
            margin: 'auto',
            content: `''`
        },
        '&::after': {
            margin: 'auto',
            content: `''`
        }
    },
    quickReply: {
        margin: '0px 5px'
    },
    button: theme.chat.message.quickReply
});

/**
 * Format for Quick Replies and handle the clicks on each Quick Reply.
 */
function QuickReplies({
    bubbles,
    pubnub,
    room,
    saveAndSendMessage,
    sendGoToBlocksViaPubnub,
    classes
}) {
    async function handleClick(quickReply) {
        const { goToBlocks, text } = quickReply;

        // 1) First, send the text of the Quick Reply clicked as text message.
        const message = createMessage(room._id, { text }, pubnub);

        await saveAndSendMessage(message);

        // 2) Then, notify the bot about the block of information (the FAQ) the client wants to see.
        await sendGoToBlocksViaPubnub(goToBlocks, message);
    }

    function renderQuickReplies() {
        return (
            <div className={classes.quickReplies}>
                {bubbles.map((quickReply, index) => {
                    const { text } = quickReply;

                    return (
                        <ButtonBase
                            key={index}
                            disabled={!isClientURL()}
                            onClick={() => handleClick(quickReply)}
                            className={classNames(
                                classes.quickReply,
                                classes.button
                            )}
                        >
                            {`${text}`}
                        </ButtonBase>
                    );
                })}
            </div>
        );
    }
    return <div className={classes.quickReplies}>{renderQuickReplies()}</div>;
}

function mapStateToProps({ chat }) {
    const { pubnub } = chat;
    const { room } = chat.selectedRoom;
    return { pubnub, room };
}

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withStyles(styles)
);

QuickReplies.propTypes = {
    bubbles: PropTypes.array.isRequired
};

export default enhancer(QuickReplies);
