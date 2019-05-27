import _ from 'lodash';
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import InfiniteScroll from 'react-infinite-scroller';
// The style for LightBox only needs to be imported once in the app.
import 'react-image-lightbox/style.css';

import * as actions from '../../../../../actions';
import Message from './Message';

const styles = theme => ({
    chatContent: {
        overflowX: 'hidden',
        overflowY: 'auto',
        // Height is necessary for the Infinite Scroll component. Else, scroll doesn't work.
        height: '100%'
    },
    history: {
        '& > :first-child': {
            marginTop: 10
        },
        '& > :last-child': {
            marginBottom: 70
        },
        display: 'flex',
        flexDirection: 'column'
    },
    scrollLoader: {
        margin: '10px 0px',
        textAlign: 'center'
    }
});

/**
 * @class Render all elements of the chat content: the messages.
 */
class ChatContent extends Component {
    constructor(props) {
        super(props);

        this.chatContentRef = React.createRef();
        this.historyRef = React.createRef();

        this.renderMessages = this.renderMessages.bind(this);
        this.fetchMoreMessages = this.fetchMoreMessages.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    componentDidMount() {
        setTimeout(this.scrollToBottom, 50);
    }

    /**
     * We scroll to the bottom of UI when:
     * - there's a new message on the history (not old messages
     * fetched).
     * - the user selected the individual chat for another
     * (=== selected room on Redux Store changes).
     */
    componentDidUpdate(prevProps) {
        const prevPropsHistory = prevProps.history;
        const propsHistory = this.props.history;

        if (
            prevPropsHistory !== null &&
            ((prevPropsHistory.length === 0 && propsHistory.length > 0) ||
                (propsHistory !== prevPropsHistory &&
                    propsHistory[propsHistory.length - 1] &&
                    prevPropsHistory[prevPropsHistory.length - 1] &&
                    propsHistory[propsHistory.length - 1].key !==
                        prevPropsHistory[prevPropsHistory.length - 1].key) ||
                prevProps.room !== this.props.room)
        ) {
            this.scrollToBottom();
        }
    }

    /**
     * Render each message. We render first the oldest message, the
     * last the newest.
     * @return List of rendered messages.
     */
    renderMessages() {
        let { history, classes } = this.props;

        history = history
            .map(message => (
                <Message key={message.timetoken} message={message} />
            ))
            .reverse();

        return (
            <div ref={this.historyRef} className={classes.history}>
                {history}
            </div>
        );
    }

    /**
     * Fetch older messages from the database.
     */
    fetchMoreMessages() {
        this.props.fetchHistory();
    }

    /**
     * Scroll the chat content to the bottom (where there are the newest
     * message) only when the component is initialized and the user/client
     * receives a new message.
     */
    scrollToBottom() {
        // We have to delay until all DOM elements sizes are mounted properly.
        setTimeout(() => {
            this.chatContentRef.current.scrollTop = this.chatContentRef.current.scrollHeight;
        }, 50);
    }

    render() {
        const { history, hasMoreMessages, classes, t } = this.props;

        return (
            <div className={classes.chatContent} ref={this.chatContentRef}>
                <InfiniteScroll
                    isReverse={true}
                    loadMore={this.fetchMoreMessages}
                    hasMore={hasMoreMessages}
                    initialLoad={false}
                    threshold={300}
                    useWindow={false}
                    getScrollParent={() => this.chatContentRef.current}
                    loader={
                        <Typography
                            key="chatContentLoader"
                            variant="caption"
                            className={classes.scrollLoader}
                        >
                            {t('general.loader')}
                        </Typography>
                    }
                >
                    {history !== null ? this.renderMessages() : <div />}
                </InfiniteScroll>
            </div>
        );
    }
}

function mapStateToProps({ chat }) {
    const { room, history, hasMoreMessages } = chat.selectedRoom;

    return {
        room,
        history,
        hasMoreMessages
    };
}

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withNamespaces('chatClient'),
    withStyles(styles)
);

export default enhancer(ChatContent);
