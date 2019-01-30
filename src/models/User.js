"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        personalInfo: {
            fullName: String,
            firstName: {
                type: String,
                required: true
            },
            googleEmail: {
                type: String,
                required: true
            },
            defaultEmail: String,
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
        _university: {
            type: Schema.Types.ObjectId,
            ref: "University"
        },
        _faculties: [{ type: Schema.Types.ObjectId, ref: "Faculty" }],
        auth: {
            googleId: {
                type: String,
                required: true
            }
        }
    },
    // Mongoose will store all objects even they are empty
    { minimize: false }
);

mongoose.model("users", userSchema);
