import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import ArrowBackIcon from './ArrowBackIcon';
import { ROUTES } from '../utils/routes';

const styles = theme => ({
    grow: {
        flexGrow: 1
    }
});

/**
 * Navigation bar for the settings.
 * @param {object} classes - Styling the component.
 */
function SettingsBar({ classes }) {
    return (
        <Toolbar>
            <ArrowBackIcon />
            <Typography variant="h6" color="inherit" noWrap>
                {ROUTES.settings.title}
            </Typography>
            <div className={classes.grow} />
        </Toolbar>
    );
}

export default withStyles(styles)(SettingsBar);
