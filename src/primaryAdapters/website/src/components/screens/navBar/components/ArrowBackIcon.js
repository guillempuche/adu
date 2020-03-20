import classNames from 'classnames';
import React from 'react';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Tooltip from '@material-ui/core/Tooltip';

import ROUTES from '../../../../utils/routes';

const styles = theme => ({
    appBarNavigationIcon: theme.components.appBar.navigationIcon,
    arrowBackButton: {
        color: theme.palette.primary.contrastText
    }
});

/**
 * Icon when is clicked we go to different site according to the URL.
 */
function ArrowBack({ location, history, classes, t }) {
    function goTo() {
        const { chatUser, chatUserIndividual } = ROUTES;
        // if (location.pathname === chatUserIndividual.path)
        //     history.push(chatUser.path);
        // else history.goBack();
        history.goBack();
    }

    return (
        <Tooltip title={t('button.arrow-back')}>
            <IconButton
                className={classNames(
                    classes.appBarNavigationIcon,
                    classes.arrowBackButton
                )}
                onClick={goTo}
            >
                <ArrowBackIcon />
            </IconButton>
        </Tooltip>
    );
}

const enhancer = compose(
    withRouter,
    withTranslation('common'),
    withStyles(styles)
);

export default enhancer(ArrowBack);
