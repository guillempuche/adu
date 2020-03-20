import _ from 'lodash';
import React, { Fragment, useState } from 'react';
import { Route, useLocation, useHistory } from 'react-router-dom';
import classNames from 'classnames';

// Style
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import MessageIcon from '@material-ui/icons/Message';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import { useAuth0 } from '../../screens/login/auth0-wrapper';
import { useQuery } from '@apollo/react-hooks';
import { GET_ME } from '../../../graphql/fetch';
import ROUTES from '../../../utils/routes';
import BarChat from './bars/chat/BarChat';
import BarFAQs from './bars/BarFAQs';
import BarSettings from './bars/BarSettings';

const useStyles = makeStyles(theme => ({
	appBarTheme: theme.components.appBar.shadow,
	appBarMargins: theme.components.appBar.sideMargins,
	appBar: {
		width: '100%'
	},
	appBarNavigationIcon: theme.components.appBar.navigationIcon,
	barFrame: {
		display: 'flex',
		alignItems: 'center',
		width: '100%'
	},
	childrenBar: {
		flexGrow: 1
	},
	drawerTitle: {
		margin: '22px 16px 18px 16px'
	},
	// barFrameTheme: theme.components.appBar.margins,
	link: {
		textDecoration: 'none'
	}
}));

/**
 * We render different main bars according to the url & render the Drawer.
 *
 * Follow the standard dimensions for App Bar, Drawer & List:
 *      - https://material.io/design/components/app-bars-top.html#specs
 *      - https://material.io/design/components/navigation-drawer.html#specs
 *      - https://material.io/design/components/lists.html#specs
 */
function BarFrame() {
	const { error, data } = useQuery(GET_ME);
	const [openDrawer, setDrawer] = useState(false);
	let location = useLocation();
	let history = useHistory();
	const { logout } = useAuth0();
	const classes = useStyles();

	if (error) console.error(error);

	return (
		<Fragment>
			<Route exact={false} path={ROUTES.app.path}>
				<AppBar
					position="static"
					className={classNames(
						classes.appBarTheme,
						classes.appBar,
						classes.appBarMargins
					)}
				>
					<Toolbar disableGutters>
						<div className={classes.barFrame}>
							<Route
								exact
								path={ROUTES.chatUser.path}
								render={renderMenuIcon}
							/>
							<Route
								path={[ROUTES.faqs.path, ROUTES.settings.path]}
								render={renderMenuIcon}
							/>
							<div className={classes.childrenBar}>
								<Route
									path={ROUTES.chatUser.path}
									component={BarChat}
								/>
								<Route
									path={ROUTES.faqs.path}
									component={BarFAQs}
								/>
								<Route
									path={ROUTES.settings.path}
									component={BarSettings}
								/>
							</div>
						</div>
					</Toolbar>
				</AppBar>
				<Drawer anchor="left" open={openDrawer} onClose={handleDrawer}>
					<div>
						<div className={classes.drawerTitle}>
							<Typography variant="h5">Au</Typography>
							<Typography variant="caption">
								{/* <Query query={GET_ME}>
                                    {({ err, data }) => { */}
								{data && data.getMe && data.getMe.success
									? _.truncate(data.getMe.user.emails.auth, {
											length: 25
									  })
									: ''}

								{/* }}
                                </Query> */}
							</Typography>
						</div>
						<div>{renderList(logout)}</div>
					</div>
				</Drawer>
			</Route>
		</Fragment>
		//     )}
		// </Auth0Context.Consumer>
	);

	/**
	 * Toggle the Drawer's opening state.
	 */
	function handleDrawer() {
		setDrawer(!openDrawer);
	}

	/**
	 * Render the whole list.
	 */
	function renderList(logout) {
		return (
			<List>
				<ListItem
					key="chats"
					button
					selected={isSelected(ROUTES.chatUser.path)}
					onClick={() => goTo(ROUTES.chatUser.path)}
				>
					<ListItemIcon>
						<MessageIcon />
					</ListItemIcon>
					<ListItemText primary={ROUTES.chatUser.title} />
				</ListItem>
				<ListItem
					key="faqs"
					button
					selected={isSelected(ROUTES.faqs.path)}
					onClick={() => goTo(ROUTES.faqs.path)}
				>
					<ListItemIcon>
						<TextFieldsIcon />
					</ListItemIcon>
					<ListItemText primary={ROUTES.faqs.title} />
				</ListItem>
				<ListItem
					key="settings"
					button
					selected={isSelected(ROUTES.settings.path)}
					onClick={() => goTo(ROUTES.settings.path)}
				>
					<ListItemIcon>
						<SettingsIcon />
					</ListItemIcon>
					<ListItemText primary={ROUTES.settings.title} />
				</ListItem>
				<ListItem key="logout" button onClick={() => logout()}>
					<ListItemIcon>
						<ExitToAppIcon />
					</ListItemIcon>
					<ListItemText primary={ROUTES.logout.title} />
				</ListItem>
			</List>
		);
	}

	/**
	 * Redirect to the given URL & close the Drawer.
	 *
	 * @param {string} path URL's path where we want to redirect.
	 */
	function goTo(path) {
		history.push(path);

		handleDrawer();
	}

	/**
	 * Return if the current URL is the same as the list item.
	 * @param {*} path URL's path
	 * @return {boolean}
	 */
	function isSelected(path) {
		const { pathname } = location;

		if (pathname === path) return true;
		else return false;
	}

	function renderMenuIcon() {
		return (
			<div>
				<IconButton
					color="inherit"
					onClick={handleDrawer}
					className={classes.appBarNavigationIcon}
				>
					<MenuIcon />
				</IconButton>
			</div>
		);
	}
}

export default BarFrame;
