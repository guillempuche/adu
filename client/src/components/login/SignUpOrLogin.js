import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = theme => ({
    root: {
        flexGrow: 1
    },
    paper: {
        alignItems: "center",
        alignContent: "center",
        textAlign: "center",
        margin: theme.spacing.unit * 6,
        padding: theme.spacing.unit * 5
    },
    button: {
        margin: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 2
    },
    iconButton: {
        marginLeft: theme.spacing.unit * 2
    },
    progress: {
        marginLeft: theme.spacing.unit * 2
    }
});

class SignUpOrLogin extends Component {
    constructor(props) {
        super(props);
        this.state = { loginClicked: false };

        this.logging = this.logging.bind(this);
    }

    logging = () => {
        this.setState(state => ({
            loginClicked: !state.loginClicked
        }));
    };

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Grid container>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <Typography variant="title">
                                Inicia Sesión
                            </Typography>
                            <Typography component="p">
                                Para guardar todas las conversaciones con los
                                estudiantes debes iniciar sesión
                            </Typography>
                            <Button
                                href="/auth/google"
                                onClick={this.logging}
                                variant="contained"
                                size="large"
                                color="primary"
                                className={classes.button}
                            >
                                Iniciar sesión con Google
                                {this.state.loginClicked ? (
                                    <CircularProgress
                                        className={classes.progress}
                                        color="inherit"
                                        size={30}
                                    />
                                ) : (
                                    <Icon className={classes.iconButton}>
                                        check_circle
                                    </Icon>
                                )}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(SignUpOrLogin);
