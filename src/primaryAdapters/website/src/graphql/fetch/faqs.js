import gql from 'graphql-tag';

// ================================================
//          FRAGMENTS
// ================================================
const Fragments = {
    question: gql`
        fragment FaqsQuestion on Question {
            _id
            public
            categories
            question_enUS
            question_esES
            question_ca
            metadata {
                enabled
            }
        }
    `
};

// ================================================
//          QUERIES
// ================================================
const QUESTIONS_QUERY = gql`
    query getAllFaqsQuestions {
        faqs {
            questions {
                ...FaqsQuestion
            }
        }
    }
    ${Fragments.question}
`;

// ================================================
//          MUTATIONS
// ================================================
const UPDATE_QUESTION = gql`
    mutation UpdateFaqsQuestion($input: UpdateFaqsQuestionInput!) {
        updateFaqsQuestion(input: $input) {
            question {
                ...FaqsQuestion
            }
        }
    }
    ${Fragments.question}
`;

export { QUESTIONS_QUERY, UPDATE_QUESTION };
