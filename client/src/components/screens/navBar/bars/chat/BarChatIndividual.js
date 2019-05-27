import _ from 'lodash';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';

import * as actions from '../../../../../actions';
import ArrowBackIcon from '../../components/ArrowBackIcon';
import Profile from './BarChatIndividualProfile';
import Filter from './BarChatIndividualFilter';

const styles = theme => ({
    barChatIndividual: {
        width: '100%',
        display: 'flex',
        alignItems: 'center'
    },
    barItems: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

/**
 * @function BarChatIndividual We render different chat bar for users according to
 * the size of the screen.
 */
function BarChatIndividual({ width, room, classes, t }) {
    function renderBar() {
        return (
            <div className={classes.barItems}>
                <div>
                    <Profile />
                </div>
                <div>
                    <Filter />
                </div>
            </div>
        );
    }

    if (_.isEmpty(room)) return null;
    else
        return (
            <div className={classes.barChatIndividual}>
                {width === 'xs' ? (
                    <Fragment>
                        <div>
                            <ArrowBackIcon />
                        </div>
                        {renderBar()}
                    </Fragment>
                ) : width === 'sm' ? (
                    renderBar()
                ) : null}
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
    withStyles(styles),
    withWidth()
);

export default enhancer(BarChatIndividual);
