import _ from 'lodash';
import React, { Fragment } from 'react';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { Switch, Route } from 'react-router-dom';
import withWidth from '@material-ui/core/withWidth';

import ROUTES from '../../../../../utils/routes';
import BarChatIndividual from './BarChatIndividual';
import BarChatList from './BarChatList';

const styles = theme => ({
    barChat: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    rightColumn: {
        width: '65%'
    }
});

/**
 * @function BarChat Render the bars for user's chats according to screen
 * size & URLs.
 */
function BarChat({ width, classes }) {
    return (
        <div className={classes.barChat}>
            <Switch>
                <Route exact path={ROUTES.chatUser.path}>
                    {width === 'sm' ? (
                        <Fragment>
                            <div>
                                <BarChatList />
                            </div>
                            <div className={classes.rightColumn}>
                                <BarChatIndividual />
                            </div>
                        </Fragment>
                    ) : (
                        <BarChatList />
                    )}
                </Route>
                <Route exact path={ROUTES.chatUserIndividual.path}>
                    {width === 'xs' ? <BarChatIndividual /> : null}
                </Route>
            </Switch>
        </div>
    );
}

const enhancer = compose(
    withStyles(styles),
    withWidth()
);

export default enhancer(BarChat);
