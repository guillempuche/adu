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
            emails: {
                auth: { type: String, required: true },
                account: String,
                others: [String]
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
                default: false
            }
        },
        role: { type: String, default: null },
        _faculties: [
            {
                type: Schema.Types.ObjectId,
                ref: 'faculties'
            }
        ]
    },
    // Mongoose will store all objects even they are empty
    { minimize: false }
);

module.exports = mongoose.model('users', userSchema);
