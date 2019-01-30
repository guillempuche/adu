"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;
const MessageSchema = require("./Message"); // Sub-document schema

const clientSchema = new Schema(
    {
        clientId: String,
        personalInfo: {
            name: String,
            email: String
        },
        messages: [MessageSchema],
        _university: {
            type: Schema.Types.ObjectId,
            ref: "University",
            required: true
        }
    }
    // Mongoose will store all objects even they are empty
    //{ minimize: false }
);

mongoose.model("clients", clientSchema);
