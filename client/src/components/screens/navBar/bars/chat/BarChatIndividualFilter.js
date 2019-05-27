import React, { Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import GradeIcon from '@material-ui/icons/Grade';
import GradeOutlinedIcon from '@material-ui/icons/GradeOutlined';

import * as actions from '../../../../../actions';

const styles = theme => ({
    filter: {
        display: 'flex',
        alignItems: 'center'
    }
});

/**
 * @function BarChatIndividualProfile Profile bar of the individual chat.
 */
function BarChatIndividualProfile({ room, setRoomAttributes, classes, t }) {
    const { state } = room.attributes;
    return (
        <div className={classes.filter}>
            <Tooltip placement="bottom" title={t('tooltip.filter-solved')}>
                <div>
                    <IconButton
                        color="inherit"
                        disabled={state === 'solved'}
                        onClick={() => setRoomAttributes({ state: 'solved' })}
                    >
                        <DoneIcon />
                    </IconButton>
                </div>
            </Tooltip>
            <Tooltip placement="bottom" title={t('tooltip.filter-unsolved')}>
                <div>
                    <IconButton
                        color="inherit"
                        disabled={state === 'unsolved'}
                        onClick={() => setRoomAttributes({ state: 'unsolved' })}
                    >
                        <ClearIcon />
                    </IconButton>
                </div>
            </Tooltip>
            <Tooltip placement="bottom" title={t('tooltip.filter-followup')}>
                <div>
                    <IconButton
                        color="inherit"
                        disabled={state === 'followup'}
                        onClick={() => setRoomAttributes({ state: 'followup' })}
                    >
                        {state === 'followup' ? (
                            <GradeIcon />
                        ) : (
                            <GradeOutlinedIcon />
                        )}
                    </IconButton>
                </div>
            </Tooltip>
        </div>
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
    withNamespaces('bar'),
    withStyles(styles)
);

export default enhancer(BarChatIndividualProfile);
