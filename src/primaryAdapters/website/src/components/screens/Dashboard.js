import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { useQuery } from '@apollo/react-hooks';

import ROUTES from '../../utils/routes';
import BarFrame from './navBar/BarFrame';
import ChatUserFrame from './chat/ChatUserFrame';
import Settings from './settings/Settings';
import FaqsFrame from './faqs/FaqsFrame';
import Error from './Error';

const useStyles = makeStyles(theme => ({
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
}));

/**
 * @function Dashboard It has the main frames for the app for users.
 *
 * Main custom components used:
 * - `BarFrame`: Navigation bar.
 * - `ChatUserFrame`, `Settings`, `FaqsFrame`: View of the chats, settings and database frames.
 * - `Error`: show the errors on the UI.
 */
function Dashboard() {
	// const {data} = useQuery(GET_FACULTY_ID)
	const classes = useStyles();

	// useEffect(() => {
	// 	if (data && data.facultyId)

	// }, [data])
	// if (!data || !data.facultyId) return "Getting faculty id"
	// else
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
					<Route path={ROUTES.faqs.path} component={FaqsFrame} />
					{/* All other URLs will we redirected to the Chat component. */}
					<Route path={ROUTES.app.path}>
						<Redirect to={ROUTES.settings.path} />
					</Route>
				</Switch>
			</div>
			<Error />
		</div>
	);
}

export default Dashboard;
