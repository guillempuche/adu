import { fakeApi } from "./fake";
// import { reduxForm } from "redux-form";

export const submitForm = form => {
    console.log("Submitted form with values =", form);

    //send the values to the server:
    fakeApi
        .submit(form)
        .then(result => {
            // do something with successful submit
            console.log("Submitted form with values", form);
        })
        .catch(error => {
            //do something with an error from the server,
            //ie return redux errors { field1: 'some error for field1', field2: 'some error for field2' }
        });
};

/*
export default reduxForm({
    form: "universityForm"
})(submitForm);
*/
