'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const facultySchema = new Schema(
    {
        name: String,
        //uuid: { type: String, required: true },
        // acronym: String,
        // _users: [{ type: Schema.Types.ObjectId, ref: 'users' }]
    },
    // Mongoose will store all objects even they are empty
    { minimize: false }
);

mongoose.model('faculties', facultySchema);
