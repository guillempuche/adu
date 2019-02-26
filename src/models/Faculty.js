'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const facultySchema = new Schema(
    {
        name: String,
        acronym: String,
        _users: [{ type: Schema.Types.ObjectId, ref: 'users' }],
        _university: { type: Schema.Types.ObjectId, ref: 'university' }
    },
    // Mongoose will store all objects even they are empty
    { minimize: false }
);

mongoose.model('faculties', facultySchema);
