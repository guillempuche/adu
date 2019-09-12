const { getFaqsQuestions, updateFaqsQuestion } = require('../faqs/data');

module.exports = {
    // ======================
    //          QUERIES
    // ======================
    RootQuery: {
        faqs: () => {
            return { questions: getFaqsQuestions() };
        }
    },
    Faqs: {
        questions: parent => parent.questions
    },
    // ======================
    //          MUTATIONS
    // ======================
    RootMutation: {
        updateFaqsQuestion: async (parent, { input }) => {
            const response = await updateFaqsQuestion(
                input.action,
                input.question
            );
            return { question: response };
        }
    }
};

// const q = [
//     {
//         _id: '1',
//         public: ['bachelor'],
//         categories: ['enrolment', 'schedule'],
//         question_enUS: 'Dates for admissions for members',
//         question_esES: 'Horario para matriculación de miembros',
//         question_ca: 'Horari per matriculació de membres',
//         metadata: {
//             enabled: false
//         }
//     }
// ];
