import React, { useEffect } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ROUTES from '../../../../utils/routes';
import * as actions from '../../../../actions';
import QuestionsTable from './QuestionsTable';
import QuestionsTablePredefinedValues from './QuestionsTablePredefinedValues';

const styles = () => ({
    table: {
        overflowX: 'auto'
    }
});

function QuestionsFrame({ superuser, fetchAppSettings, classes }) {
    useEffect(() => {
        fetchAppSettings();
    }, [fetchAppSettings]);

    // Don't show questions if the user isn't a superuser.
    if (!superuser) return <Redirect to={ROUTES.faqs.path} />;

    return (
        <div>
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Predefined Values for Questions</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <div>
                        <QuestionsTablePredefinedValues />
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
                // Performane optimization
                TransitionProps={{ unmountOnExit: true }}
            >
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Questions</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <div className={classes.table}>
                        <QuestionsTable />
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </div>
    );
}

function mapStateToProps({ auth }) {
    // TIP: 'superuser' variable only exists for superusers.
    const { superuser } = auth.userType;
    return { superuser };
}

const enhancer = compose(
    connect(
        mapStateToProps,
        actions
    ),
    withStyles(styles)
);

export default enhancer(QuestionsFrame);
