import React from 'react';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({});

/**
 * @function BarFAQs Render bar of the FAQs Editor.
 */
function BarFAQs({ t }) {
    return (
        <Typography variant="h6" color="inherit">
            {t('faqs')}
        </Typography>
    );
}

const enhancer = compose(
    withNamespaces(['routesTitles']),
    withStyles(styles)
);

export default enhancer(BarFAQs);
