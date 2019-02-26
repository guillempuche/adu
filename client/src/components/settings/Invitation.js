import React, { Fragment } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { withNamespaces } from 'react-i18next';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    code: {
        marginTop: theme.spacing.unit * 2
    },
    text: {
        ...theme.mixins.gutters(),
        margin: theme.spacing.unit,
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2
    }
});

function Invitation({ faculties, t, classes }) {
    const renderFaculties = faculties.map(({ name, id }) => (
        <div key={id} className={classes.code}>
            <Typography variant="body2" align="left">
                {t('text.content-title-faculty')}: {name}
            </Typography>
            <Typography variant="body2" align="left">
                {t('text.content-code-faculty')}: {id}
            </Typography>
        </div>
    ));

    return (
        <Paper className={classes.text}>
            <Typography variant="body1" align="left">
                {t('text.title-onboarding')}
            </Typography>
            {renderFaculties}
        </Paper>
    );
}

function mapStateToProps({ auth }) {
    const faculties = auth._faculties.map(faculty => {
        return {
            name: faculty.name,
            id: faculty._id
        };
    });

    return { faculties };
}

const enhance = compose(
    withNamespaces('settings'),
    withStyles(styles),
    connect(mapStateToProps)
);

export default enhance(Invitation);
