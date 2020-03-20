import React from 'react';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({});

/**
 * @function BarSettings Render bar of the settings.
 */
function BarSettings({ t }) {
    return (
        <Typography variant="h6" color="inherit">
            {t('settings')}
        </Typography>
    );
}

const enhancer = compose(
    withTranslation(['routesTitles']),
    withStyles(styles)
);

export default enhancer(BarSettings);
