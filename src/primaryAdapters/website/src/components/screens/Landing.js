import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    }
});

const Landing = props => {
    const { classes } = props;

    return (
        <div>
            <Paper className={classes.root}>
                <Typography variant="title">Landing Page</Typography>
            </Paper>
        </div>
    );
};

export default withStyles(styles)(Landing);
