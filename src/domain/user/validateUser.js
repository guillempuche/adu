'use strict';

const Schema = require('validate');

function emailValidator(data) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        data
    );
}

const Joi = require('@hapi/joi');
const userSchema = Joi.object({
    _id: Joi.string().required(),
    name: Joi.object().keys({
        displayName: Joi.string().required(),
        fullName: Joi.string()
    }),
    emails: Joi.object().keys({
        auth: Joi.string().email(),
        account: Joi.string().email()
    }),
    profilePicture: Joi.string().uri(),
    roles: Joi.array().items(
        Joi.string()
            .valid('superadmin', 'admin', 'visitor', 'anonymous')
            .required()
    ),
    _faculties: Joi.array().items(Joi.string())
});

const draftSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        displayName: {
            type: String,
            required: true
        },
        fullName: String
    },
    emails: {
        auth: {
            type: String,
            use: { emailValidator },
            required: true,
            message:
                'emails.auth is required and has to be a valid email format.'
        },
        account: {
            type: String,
            use: { emailValidator },
            message: 'emails.account has to be a valid email format.'
        }
    },
    profilePicture: String,
    roles: {
        type: Array,
        elements: [{ type: String }]
        // each: {
        //     type: String
        //     //enum: ['superadmin', 'admin', 'visitor', 'anonymous']
        //     //required: true,
        //     // message: {
        //     //     type:
        //     //         'Role has to be string: superadmin, admin, visitor and/or anonymous.',
        //     //     required: 'Role is required.'
        //     // }
        // }
    },
    _faculties: {
        type: Array,
        each: { type: String }
    }
});

module.exports = user => {
    return Joi.validate(user, userSchema, (err, value) => {
        if (err) {
            console.log('validate - user', user);
            console.log('validate - errors', JSON.stringify(value));
            //errors = errors.forEach(err => err).toString();
            throw new Error(`Error on validate the user. ${value}`);
        }
        return null;
    });
};
