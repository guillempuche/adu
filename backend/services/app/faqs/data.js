/**
 * Deal with FAQs's data.
 *
 * Methods:
 * - `getFaqsQuestions` Get all questions
 * - `updateFaqsQuestion` Add/edit/delete a set of question on Questions DB, Algolia & Recombee.
 */
'use strict';

const mongoose = require('mongoose');
var $ = require('mongo-dot-notation');
const logger = require('../utils/logger').logger(__filename);

const Question = require('../models/Question');

/**
 * Get all questions
 * @return {Array} List of questions
 */
async function getFaqsQuestions() {
    try {
        const questions = await Question.find().lean();

        return questions;
    } catch (err) {
        logger.error(`#API Error on getting all questions. ${err}`);
    }
}

/**
 * Add/edit/delete a question on DB, Algolia & Recombee.
 * @param {string} action Can be: `NEW`, `EDIT` or `DELETE`.
 * @param {Object} question Question's data for processing the action.
 * @return {Object} Updated question.
 */
async function updateFaqsQuestion(action, question) {
    try {
        if (action === 'NEW') {
            // We don't want any property with name '_id', MongoDB will create it automatically.
            if (question._id) delete question._id;

            return await new Question(question).save();
        } else if (action === 'EDIT') {
            const operator = $.flatten(question);

            return await Question.findByIdAndUpdate(question._id, operator, {
                runValidators: true,
                new: true
            });
        } else if (action === 'DELETE') {
            return await Question.findByIdAndDelete(question._id);
        }
    } catch (err) {
        logger.error(
            `#API #DB Error on ${action} the question=${JSON.stringify(
                question
            )}. ${err}`
        );

        throw Error(`Error on ${action} the question`);
    }
}

module.exports = {
    getFaqsQuestions,
    updateFaqsQuestion
};
