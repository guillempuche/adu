const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
    public: {
        type: [String]
        // required: true
    },
    categories: {
        type: [String]
        // required: true
    },
    // English
    question_enUS: {
        type: String
        // required: true
    },
    // Spanish (Spain)
    question_esES: {
        type: String
        // required: true
    },
    // Catalan
    question_ca: {
        type: String
        // required: true
    },
    metadata: {
        // Is the question available to faculties?
        enabled: {
            type: Boolean,
            default: false,
            required: true
        }
    }
});

module.exports = mongoose.model('questions', questionSchema);
