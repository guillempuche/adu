'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const universitySchema = new Schema(
    {
        name: String,
        acronym: String,
        _faculties: [{ type: Schema.Types.ObjectId, ref: 'faculties' }],
        _users: [{ type: Schema.Types.ObjectId, ref: 'users' }]
    },
    // Mongoose will store all objects even they are empty
    { minimize: false }
);

mongoose.model('universities', universitySchema);
