'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        auth: {
            auth0UserId: {
                type: String,
                required: true
            }
        },
        personalInfo: {
            name: {
                nickName: String,
                displayName: {
                    type: String,
                    required: true
                },
                givenName: String,
                familyName: String
            },
            email: {
                default: {
                    type: String,
                    required: true
                }
            },
            profilePicture: String
        },
        userType: {
            superadmin: {
                type: Boolean,
                default: false
            },
            admin: {
                type: Boolean,
                default: true
            }
        },
        _university: {
            type: Schema.Types.ObjectId,
            ref: 'University'
        },
        _faculties: [{ type: Schema.Types.ObjectId, ref: 'Faculty' }]
    },
    // Mongoose will store all objects even they are empty
    { minimize: false }
);

mongoose.model('users', userSchema);
