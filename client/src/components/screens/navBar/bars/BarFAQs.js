import React from 'react';
import { compose } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ROUTES from '../../../../utils/routes';

const styles = theme => ({});

/**
 * @function BarFAQs Render bar of the FAQs Editor.
 */
function BarFAQs({}) {
    return (
        <Typography variant="h6" color="inherit">
            {ROUTES.faqs.title}
        </Typography>
    );
}

const enhancer = compose(withStyles(styles));

export default enhancer(BarFAQs);
