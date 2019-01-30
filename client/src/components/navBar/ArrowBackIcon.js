import React from 'react';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
    arrowBackButton: {
        color: theme.palette.primary.contrastText,
        marginLeft: -12,
        marginRight: 20
    }
});

/**
 * Icon to go back on the app.
 * @param {object} classes - Styling the component.
 * @param {object} t - Internationalization.
 * @param {object} history - Get URL information.
 */
function ArrowBack({ classes, t, history }) {
    return (
        <Tooltip title={t('button.arrow-back')}>
            <IconButton
                className={classes.arrowBackButton}
                onClick={history.goBack}
            >
                <ArrowBackIcon />
            </IconButton>
        </Tooltip>
    );
}

const enhance = compose(
    withStyles(styles),
    withNamespaces('common'),
    withRouter
);

export default enhance(ArrowBack);
