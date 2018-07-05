"use strict";

const mongoose = require("mongoose");

const { Schema } = mongoose;

const universitySchema = new Schema({
    name: String,
    acronym: String,
    _faculties: [{ type: Schema.Types.ObjectId, ref: "Faculty" }],
    _users: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

model("universities", universitySchema);
