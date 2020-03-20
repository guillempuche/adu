import React, { Fragment } from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import ROUTES from '../../../../utils/routes';

const styles = theme => ({
    link: {
        textDecoration: 'none'
    }
});

/**
 * Menu for the navigation bar that it's rendered when the screen is small.
 * @param {object} classes - Styling the component.
 * @param {object} t - Internationalization.
 */
function ChatAppBarMenu({ classes, t }) {
    return (
        <Fragment>
            <Link to={ROUTES.settings.path} className={classes.link}>
                {/* IMPORTANT:
                    - Anchor tag: navigate to a completely different HTML document.
                    - Link tag: navigate to a different route rendered by React Router.
                    */}
                <MenuItem>
                    <ListItemIcon>
                        <AccountCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu.settings')} />
                </MenuItem>
            </Link>
            <a href={ROUTES.logout.path} className={classes.link}>
                <MenuItem>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu.logout')} />
                </MenuItem>
            </a>
        </Fragment>
    );
}

const enhancer = compose(
    withTranslation('mainBar'),
    withStyles(styles)
);

export default enhancer(ChatAppBarMenu);
