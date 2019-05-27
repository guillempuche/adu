import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import ROUTES from '../../utils/routes';
import BarFrame from './navBar/BarFrame';
import ChatUserFrame from './chat/ChatUserFrame';
import Settings from './settings/Settings';
import Database from './Database';
import Error from './Error';

const styles = theme => ({
    dashboard: {
        display: 'flex',
        flexDirection: 'column',
        // Height is necessary for the components that use Infinite Scroll
        // component. Else, content fit & scroll doesn't work.
        height: '100%'
    },
    dashboardContent: {
        flexGrow: 1,
        width: '100%',
        overflowY: 'auto'
    }
});

/**
 * @function Dashboard It has the main frames for the app for users.
 *
 * Main custom components used:
 * - `BarFrame` - Navigation bar.
 * - `ChatUserFrame`, `Settings`, `Database` - View of the chats, settings and database frames.
 */
function Dashboard({ classes }) {
    return (
        <div className={classes.dashboard}>
            <div>
                <BarFrame />
            </div>
            <div className={classes.dashboardContent}>
                <Switch>
                    <Route
                        path={ROUTES.chatUser.path}
                        component={ChatUserFrame}
                    />
                    <Route path={ROUTES.settings.path} component={Settings} />
                    <Route path={ROUTES.faqs.path} component={Database} />
                    {/* All other URLs will we redirected to the Chat component. */}
                    <Route path={ROUTES.app.path}>
                        <Redirect to={ROUTES.chatUser.path} />
                    </Route>
                </Switch>
            </div>
            <Error />
        </div>
    );
}

export default withStyles(styles)(Dashboard);
