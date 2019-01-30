// Regular expression for email validation
// More info: http://emailregex.com/
const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const validateEmail = email => {
    return re.test(email);
};

export const formValidation = {
    required: "Requerido",
    email: {
        label: "E-mail inválido",
        labelOptional:
            "Rectifica el e-mail o borra todos los carácteres para continuar",
        validation: validateEmail
    }
};
