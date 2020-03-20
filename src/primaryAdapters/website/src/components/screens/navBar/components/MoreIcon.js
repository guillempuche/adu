import React from 'react';
import { withTranslation } from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import Tooltip from '@material-ui/core/Tooltip';

function More({ onClickEvent, t }) {
    return (
        <Tooltip title={t('button.more')}>
            <IconButton color="inherit" onClick={onClickEvent}>
                <MoreIcon />
            </IconButton>
        </Tooltip>
    );
}

export default withTranslation('common')(More);
