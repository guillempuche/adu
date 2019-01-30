import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import * as actions from "../../../actions";
import { submit, getFormValues } from "redux-form";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import Header from "./Header";
import UniversityForm from "./UniversityForm";
import EmailForm from "./EmailForm";
import { getStepsTitle, getOrganizationFormInfo } from "./getSteps";

const styles = theme => ({
    root: {
        width: "90%",
        flexGrow: 1
    },
    stepper: {
        alignItems: "center",
        alignContent: "center"
    },
    button: {
        marginTop: theme.spacing.unit * 2,
        marginRight: theme.spacing.unit
    },
    actionsContainer: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit
    },
    resetContainer: {
        padding: theme.spacing.unit * 3
    }
});

class Steppers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            validUniversityForm: false,
            validEmailForm: false,
            activeStep: 0,
            stepsTitle: getStepsTitle,
            organizationFormInfo: getOrganizationFormInfo
        };

        // Create a ref to store the textInput DOM element.
        this.renderStepper = this.renderStepper.bind(this);
        this.renderStepperButtons = this.renderStepperButtons.bind(this);
        this.handleValidForm = this.handleValidForm.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleBack = this.handleBack.bind(this);
    }

    renderStepper = () => {
        const {
            classes,
            submitNewUniversityForm,
            submitNewEmailForm
        } = this.props;
        const {
            activeStep,
            stepsTitle,
            validUniversityForm,
            validEmailForm
        } = this.state;

        return (
            <div className={classes.stepper}>
                <Stepper activeStep={activeStep} orientation="vertical">
                    <Step key={1}>
                        <StepLabel>
                            <Typography variant="subheading">
                                {stepsTitle[0]}
                            </Typography>
                        </StepLabel>
                        <StepContent>
                            {/*  
                            - Use onSubmit to transition forward to the next page; this forces validation to run.
                            - The ref attribute creates a reference to the DOM node accessible and we can pull this value when we need it 
                            */}
                            <UniversityForm
                                isValid={(formName, validUniversityForm) => {
                                    this.handleValidForm(
                                        formName,
                                        validUniversityForm
                                    );
                                }}
                                onSubmit={() => {
                                    // We need to save props values here (because outside this
                                    // function) form values aren't updated quickly.
                                    const { universityFormValues } = this.props;

                                    submitNewUniversityForm(
                                        universityFormValues
                                    );
                                }}
                            />
                            {this.renderStepperButtons()}
                        </StepContent>
                    </Step>
                    <Step key={2}>
                        <StepLabel>
                            <Typography variant="subheading">
                                {stepsTitle[1]}
                            </Typography>
                        </StepLabel>
                        <StepContent>
                            <EmailForm
                                isValid={(formName, validEmailForm) => {
                                    this.handleValidForm(
                                        formName,
                                        validEmailForm
                                    );
                                }}
                                onSubmit={() => {
                                    // We need to save props values here (because outside this
                                    // function) form values aren't updated quickly.
                                    const { emailFormValues } = this.props;
                                    const { validEmailForm } = this.state;

                                    submitNewEmailForm(
                                        validEmailForm ? emailFormValues : ""
                                    );
                                }}
                            />
                            {this.renderStepperButtons()}
                        </StepContent>
                    </Step>
                    <Step key={3}>
                        <StepLabel>
                            <Typography variant="subheading">
                                {stepsTitle[2]}
                            </Typography>
                        </StepLabel>
                        <StepContent>
                            <Typography>Chat web</Typography>
                            {this.renderStepperButtons()}
                        </StepContent>
                    </Step>
                </Stepper>
                {activeStep === stepsTitle.length && (
                    <Paper
                        square
                        elevation={0}
                        className={classes.resetContainer}
                    >
                        <Typography>Gracias</Typography>
                    </Paper>
                )}
            </div>
        );
    };

    renderStepperButtons = () => {
        const { validUniversityForm, activeStep, stepsTitle } = this.state;
        const {
            classes,
            dispatchUniversityForm,
            dispatchEmailForm
        } = this.props;

        return (
            <div className={classes.actionsContainer}>
                <Button
                    disabled={activeStep === 0}
                    onClick={this.handleBack}
                    className={classes.button}
                >
                    Atrás
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={validUniversityForm ? false : true}
                    onClick={
                        () => {
                            this.handleNext();
                            //return dispatch(submit("universityForm"));
                            if (activeStep === 0) dispatchUniversityForm();
                            else if (activeStep === 1) dispatchEmailForm();
                        }
                        /*

                        () => {
                        this.submitForm(activeStep);

                        switch (activeStep) {
                            case 1: {
                                /*submitUniversityForm(
                                    universityFormValues,
                                    history
                                )
                            }
                            default: {
                                this.handleNext();
                            }
                        }
                    }*/
                    }
                    className={classes.button}
                >
                    {activeStep === stepsTitle.length - 1
                        ? "Terminar"
                        : "Siguiente"}
                </Button>
            </div>
        );
    };

    // handleClick = e => this.setUniversityFormRef.submit(e);

    handleValidForm = (form, validation) => {
        if (form === "universityForm") {
            this.setState(() => ({
                validUniversityForm: validation // this.props.valid
            }));
            // console.log("estado cambiado, validation =", validation);
            // console.log("estado cambiado, props.valid =", this.props.valid);
        } else if (form === "emailForm") {
            this.setState(() => ({
                validEmailForm: validation
            }));
        }
    };

    handleNext = () => {
        if (this.state.validUniversityForm) {
            this.setState(state => ({
                activeStep: state.activeStep + 1
            }));
        }
    };

    handleBack = () => {
        this.setState(state => ({
            activeStep: state.activeStep - 1
        }));
    };

    render() {
        const { auth, classes } = this.props;

        console.log("Stepper props =", this.props);

        return (
            <div className={classes.root}>
                <Grid container>
                    <Grid item xs={12}>
                        <Header userInfo={auth.personalInfo} />
                    </Grid>
                    <Grid item xs={12}>
                        {this.renderStepper()}
                    </Grid>
                </Grid>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        auth: state.auth,
        // Access to form's values
        universityFormValues: getFormValues("universityForm")(state),
        emailFormValues: getFormValues("emailForm")(state)
    };
}

// ================================================
// We need to submit the redux forms manually
// ================================================
const dispatchUniversityForm = () => dispatch => {
    dispatch(submit("universityForm"));
};
const dispatchEmailForm = () => dispatch => {
    dispatch(submit("emailForm"));
};

const enhance = compose(
    withStyles(styles),
    connect(
        mapStateToProps,
        //actions
        //mapDispatchToProps
        //submitNewUniversityForm
        { ...actions, dispatchUniversityForm, dispatchEmailForm }
    )
);

export default enhance(withRouter(Steppers));
