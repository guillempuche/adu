const mongoose = require('mongoose');
const { Schema } = mongoose;

const public = [
    'secondary school',
    'fp',
    'adult',
    'bachelor',
    'master',
    'alumni',
    'visitor',
    'member',
    'non-member',
    'all'
];

const appSettingsSchema = new Schema({
    faqs: {
        questions: {
            public: [String],
            categories: [String]
        }
    }
});

module.exports = mongoose.model('appSettings', appSettingsSchema);
