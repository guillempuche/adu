import React, { Component } from "react";
import { reduxForm, Form, Field } from "redux-form";
import { compose } from "redux";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { getOrganizationFormInfo } from "./getSteps";
import { formValidation } from "../../utils/text/forms";
// import { submitForm } from "./submitForm";

const formName = "universityForm";

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

class UniversityForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            organizationFormInfo: getOrganizationFormInfo
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
        const { classes, invalid } = this.props;
        const { organizationFormInfo } = this.state;

        return (
            <TextField
                name={name}
                label={label}
                placeholder={organizationFormInfo.sample.university}
                required={true}
                error={invalid}
                helperText={error}
                className={classes.textField}
                margin="dense"
                {...custom}
                {...input}
            />
        );
    };

    render() {
        const { organizationFormInfo } = this.state;
        // handleSubmit and other props are passed by default by Redux Form
        const { classes, onSubmit, isValid } = this.props;

        // console.log("UniversityForm props =", this.props);

        return (
            <Form
                onSubmit={
                    () => {
                        // setTimeout(() => {});
                        // handleSubmit(() => console.log("Form guardado"));
                        onSubmit();
                    }
                    //onSubmit
                    // () => onSubmit()
                    // () => {}
                    //handleSubmit
                    // handleSubmit(() => {})
                    // handleSubmit(onSubmit)
                }
                className={classes.container}
            >
                <Grid container>
                    <Grid item xs={12}>
                        <Typography className={classes.typography}>
                            {
                                organizationFormInfo.instructions
                                    .universityInstructions
                            }
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Field
                            name={organizationFormInfo.ids.university[0]}
                            label={organizationFormInfo.labels.university[0]}
                            component={this.renderTextField}
                            onChange={e => {
                                // 'props' (that include 'valid') don't get updated from Redux until the next process tick. onChange is updated before props.
                                // More info https://github.com/erikras/redux-form/issues/883#issuecomment-216022940
                                setTimeout(() => {
                                    if (this.props.valid)
                                        isValid(formName, true);
                                    else isValid(formName, false);
                                });
                            }}
                        />
                    </Grid>
                </Grid>
            </Form>
        );
    }
}

const validate = values => {
    const fields = getOrganizationFormInfo;
    const errors = {};

    if (!values[fields.ids.university[0]]) {
        errors[fields.ids.university[0]] = formValidation.required;
    }

    return errors;
};

const enhance = compose(
    withStyles(styles),
    reduxForm({
        form: formName,
        validate,
        destroyOnUnmount: false
    })
);

export default enhance(UniversityForm);
