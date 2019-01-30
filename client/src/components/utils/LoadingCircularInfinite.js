import React, { Fragment } from "react";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = theme => ({
    progress: {
        marginTop: theme.spacing.unit * 2
    },
    positionCenter: {
        width: "30px",
        marginRight: "auto", // This margin needs a width.
        marginLeft: "auto" // This margin needs a width.
    }
});

function LoadingCircularInfinite(props) {
    const { classes, position, size } = props;

    return (
        <div
            className={classNames(
                classes.progress,
                position === "center" ? classes.positionCenter : false
            )}
        >
            <CircularProgress variant="indeterminate" size={size} />
        </div>
    );
}

export default withStyles(styles)(LoadingCircularInfinite);
