import React from 'react';
import { withNamespaces } from 'react-i18next';
import Typography from '@material-ui/core/Typography';

/**
 * @function BarChatList Render bar for chats list.
 */
function BarChatList({ t }) {
    return (
        <Typography variant="h6" color="inherit">
            {t('chatList')}
        </Typography>
    );
}

export default withNamespaces(['routesTitles'])(BarChatList);
