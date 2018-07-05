"use strict";

const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
    personalInfo: {
        fullname: String,
        firstName: String,
        email: String,
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
    _university: { type: Schema.Types.ObjectId, ref: "University" },
    _faculties: [{ type: Schema.Types.ObjectId, ref: "Faculty" }],
    auth: {
        googleId: String
    }
});

mongoose.model("users", userSchema);
