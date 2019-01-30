import React from 'react';
import { compose } from 'redux';
import { withNamespaces } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TextFieldsIcon from '@material-ui/icons/TextFields';

import { ROUTES } from '../utils/routes';

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
        <div>
            <Link to={ROUTES.settings.path} className={classes.link}>
                <MenuItem>
                    <ListItemIcon>
                        <AccountCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu.settings')} />
                </MenuItem>
            </Link>
            <Link to={ROUTES.database.path} className={classes.link}>
                <MenuItem>
                    <ListItemIcon>
                        <TextFieldsIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('menu.database')} />
                </MenuItem>
            </Link>
        </div>
    );
}

const enhance = compose(
    withStyles(styles),
    withNamespaces('chatAppBar')
);

export default enhance(ChatAppBarMenu);
