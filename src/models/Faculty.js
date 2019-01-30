"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

const facultySchema = new Schema(
    {
        name: String,
        acronym: String,
        _university: { type: Schema.Types.ObjectId, ref: "University" },
        _users: [{ type: Schema.Types.ObjectId, ref: "User" }]
    },
    // Mongoose will store all objects even they are empty
    { minimize: false }
);

mongoose.model("faculties", facultySchema);
