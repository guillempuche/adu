import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import * as actions from '../../../../../actions';

const styles = theme => ({
    buttonIcon: {
        marginRight: 12
    },
    buttonText: {
        color: theme.palette.primary.contrastText
    }
});

/**
 * @function BarChatIndividualProfile Profile bar of the individual chat.
 */
function BarChatIndividualProfile({
    room,
    handleComponentProfileDialog,
    classes,
    t
}) {
    // If member details aren't available, then email is null.
    let email = null;
    // TIP: The rooms only have one client.
    room.members.find(el => {
        if (el.type === 'client') {
            if (el.details && el.details.attributes)
                email = el.details.attributes.email;
        }
    });

    return (
        <Tooltip placement="bottom" title={t('tooltip.profile')}>
            <ButtonBase onClick={handleComponentProfileDialog}>
                <AccountCircleIcon className={classes.buttonIcon} />
                <Typography variant="body1" className={classes.buttonText}>
                    {email ? email : t('chat.profile')}
                </Typography>
            </ButtonBase>
        </Tooltip>
    );
}

function mapStateToProps({ chat }) {
    const { room } = chat.selectedRoom;
    return { room };
}

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withTranslation('bar'),
    withStyles(styles)
);

export default enhancer(BarChatIndividualProfile);
