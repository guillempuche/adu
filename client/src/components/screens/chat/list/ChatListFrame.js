import _ from 'lodash';
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { withNamespaces } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import InfiniteScroll from 'react-infinite-scroller';
import Typography from '@material-ui/core/Typography';

import * as actions from '../../../../actions';
import ROUTES from '../../../../utils/routes';
import {
    fromNow,
    getTextFromLastMessage
} from '../../../../utils/chat/messageUtils';

const styles = theme => ({
    chatListFrame: {
        // Height is necessary for the Infinite Scroll component. Else, scroll doesn't work.
        height: '100%',
        overflowY: 'auto'
    },
    scrollLoader: {
        marginTop: 10,
        maringBottom: 10,
        textAlign: 'center'
    },
    list: {
        padding: 0
    },
    listItem: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    listItemTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    listItemTitle: {
        width: 'calc(100% - 20px)',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
    },
    listItemDate: {
        whiteSpace: 'nowrap'
    },
    listItemText: {
        width: 'calc(100% - 10px)',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
    },
    listItemProgress: {
        flexGrow: 1
    }
});

class ChatListFrame extends Component {
    constructor(props) {
        super(props);

        this.renderList = this.renderList.bind(this);
        this.fetchRooms = this.fetchRooms.bind(this);
        this.handleListItemClick = this.handleListItemClick.bind(this);

        this.chatListFrameRef = React.createRef();
    }

    /**
     * We render this:
     *      - the number of room from total
     *      - the time of the most recent message
     *      - text of the ost recent message
     */
    renderList() {
        const { auth, rooms, room, width, classes, t } = this.props;

        return (
            <List className={classes.list}>
                {rooms.map(item => (
                    <ListItem
                        key={item._id}
                        divider
                        button
                        selected={width !== 'xs' && item._id === room._id}
                        // Align items when list item is displaying 3 lines or more.
                        alignItems="flex-start"
                        onClick={() => this.handleListItemClick(item)}
                    >
                        <div className={classes.listItem}>
                            <div className={classes.listItemTop}>
                                <div className={classes.listItemTitle}>
                                    <Typography variant="body1">
                                        {item._id.substr(-5)}
                                    </Typography>
                                </div>
                                <div className={classes.listItemDate}>
                                    <Typography variant="caption">
                                        {// Show the time of the most recent message.
                                        fromNow.prettierShort(
                                            _.orderBy(
                                                item.history,
                                                ['timetoken'],
                                                ['desc']
                                            )[0].timetoken
                                        )}
                                    </Typography>
                                </div>
                            </div>
                            <div className={classes.listItemText}>
                                <Typography variant="caption">
                                    {getTextFromLastMessage(item.history, auth)}
                                </Typography>
                            </div>
                        </div>
                    </ListItem>
                ))}
            </List>
        );
    }

    /**
     * Fetch more rooms.
     */
    fetchRooms() {
        this.props.fetchRooms();
    }

    /**
     * Save the room selected to Redux Store & go to the indivdual chat's URL
     * (only when the screen is smaller than medium screens).
     *
     * @param {Object} room Room selected
     */
    handleListItemClick(room) {
        const { selectRoom, width, history } = this.props;

        selectRoom(room);

        if (width === 'sm' || width === 'xs') {
            history.push(ROUTES.chatUserIndividual.path);
        }
    }

    render() {
        const { hasMoreRooms, classes, t } = this.props;

        return (
            <div className={classes.chatListFrame} ref={this.chatListFrameRef}>
                <InfiniteScroll
                    loadMore={this.fetchRooms}
                    hasMore={hasMoreRooms}
                    initialLoad={false}
                    threshold={20}
                    loader={
                        <Typography
                            key="chatListLoader"
                            variant="caption"
                            className={classes.scrollLoader}
                        >
                            {t('list.loader')}
                        </Typography>
                    }
                    useWindow={false}
                    getScrollParent={() => this.chatListFrameRef.current}
                >
                    {this.renderList()}
                </InfiniteScroll>
            </div>
        );
    }
}

function mapStateToProps({ auth, chat }) {
    const { rooms, hasMoreRooms, selectedRoom } = chat;
    const { room } = selectedRoom;

    return { auth, rooms, hasMoreRooms, room };
}

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withRouter,
    withNamespaces(['chatList']),
    withStyles(styles),
    withWidth()
);

export default enhancer(ChatListFrame);
