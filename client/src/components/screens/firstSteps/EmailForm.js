import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { compose } from "redux";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { formValidation } from "../../utils/text/forms";
import { getEmailInfo } from "./getSteps";

const formName = "emailForm";

const styles = theme => ({
    container: {
        display: "flex",
        flexWrap: "wrap"
    },
    textField: {
        margin: theme.spacing.unit,
        width: 400
    },
    typography: {
        margin: theme.spacing.unit
    }
});

class EmailForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            emailInfo: getEmailInfo
        };

        this.renderTextField = this.renderTextField.bind(this);
    }

    // Redux Form's Field component passes values by default to this method
    renderTextField = ({
        input,
        label,
        name,
        meta: { touched, error },
        ...custom
    }) => {
        const { classes, invalid, dirty } = this.props;
        const { emailInfo } = this.state;

        return (
            <TextField
                name={name}
                label={label}
                placeholder={emailInfo.sample}
                error={touched && dirty && invalid}
                helperText={touched && dirty && error}
                className={classes.textField}
                margin="dense"
                {...custom}
                {...input}
            />
        );
    };

    render() {
        const { emailInfo } = this.state;
        // handleSubmit and other props are passed by default by Redux Form
        const { classes, auth, onSubmit, isValid } = this.props;

        // console.log("EmailForm props =", this.props);

        return (
            <form
                onSubmit={() => {
                    //handleSubmit(() => console.log("Form enviado"));
                    onSubmit();
                }}
                className={classes.container}
            >
                <Grid container>
                    <Grid item xs={12}>
                        <Typography className={classes.typography}>
                            {emailInfo.instructions}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {/* Show default email */}
                        <TextField
                            label={auth.personalInfo.googleEmail}
                            disabled={true}
                            helperText={emailInfo.helper}
                            className={classes.textField}
                            margin="dense"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Field
                            name={emailInfo.id}
                            label={emailInfo.label}
                            component={this.renderTextField}
                            onChange={e => {
                                // console.log("onChange event =", e);
                                // console.log("onChange invalid =", valid);

                                // 'props' (that include 'valid') don't get updated from Redux until the next process tick. onChange is updated before props
                                // More info https://github.com/erikras/redux-form/issues/883#issuecomment-216022940
                                setTimeout(() => {
                                    if (e.target.id === "" || this.props.valid)
                                        isValid(formName, true);
                                    else isValid(formName, false);
                                });
                            }}
                        />
                    </Grid>
                </Grid>
            </form>
        );
    }
}

function mapStateToProps(state) {
    return {
        auth: state.auth
    };
}

const validate = values => {
    const fields = getEmailInfo;
    const errors = {};

    if (!formValidation.email.validation(values[fields.id])) {
        errors[fields.id] = formValidation.email.labelOptional;
    }

    return errors;
};

const enhance = compose(
    withStyles(styles),
    connect(mapStateToProps),
    reduxForm({
        form: formName,
        validate,
        destroyOnUnmount: false
    })
);

export default enhance(EmailForm);
