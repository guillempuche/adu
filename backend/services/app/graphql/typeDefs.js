const { gql } = require('apollo-server-express');

module.exports = gql`
    schema {
        query: RootQuery
        mutation: RootMutation
    }
    type RootQuery {
        faqs: Faqs
    }
    type RootMutation {
        updateFaqsQuestion(
            input: UpdateFaqsQuestionInput!
        ): UpdateFaqsQuestionPayload!
        # https://www.prisma.io/tutorials/a-guide-to-common-resolver-patterns-ct08
    }
    # #Return transactional information about the update alongside the records which have been changed.
    # #More about Mutation Response: https://www.apollographql.com/docs/apollo-server/essentials/schema/#designing-mutations
    # # https://moonhighway.com/enhancing-schemas-with-interfaces
    # interface MutationResponse {
    #     code: String!
    #     success: Boolean!
    #     message: String!
    # }

    ######################
    #       FAQS
    ######################
    type Faqs {
        # questions: [String!]! # For testing
        questions: [Question]
    }
    type Question {
        _id: ID!
        public: [String]
        categories: [String]
        question_enUS: String
        question_esES: String
        question_ca: String
        metadata: QuestionMetadata
    }
    type QuestionMetadata {
        "Is the question available to faculties?"
        # enabled(status: EnabledStatus = false): Boolean!
        enabled: Boolean
    }
    input UpdateFaqsQuestionInput {
        action: ActionFaqsQuestion!
        question: FaqsQuestionInput!
    }
    enum ActionFaqsQuestion {
        NEW
        EDIT
        DELETE
    }
    input FaqsQuestionInput {
        _id: ID!
        public: [String]
        categories: [String]
        question_enUS: String
        question_esES: String
        question_ca: String
        metadata: QuestionMetadataInput
    }
    input QuestionMetadataInput {
        enabled: Boolean
    }
    type UpdateFaqsQuestionPayload {
        question: Question
    }
`;
