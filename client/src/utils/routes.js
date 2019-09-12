import i18n from 'i18next';

const routesTitles = i18n.getResourceBundle(
    i18n.languages[i18n.languages.length - 1],
    'routesTitles'
);

/**
 * A module that exports all the urls.
 * @module ROUTES
 */
export default {
    login: {
        title: routesTitles.login,
        path: '/login' // IMPORTANT: Same pathname at server keys.
    },
    logout: {
        title: routesTitles.logout,
        path: '/api/logout' // Same oathname at server authRoute.js
    },
    auth: {
        path: '/auth' // IMPORTANT: Same pathname at server authRoute.js
    },
    landing: {
        title: routesTitles.landing,
        path: '/landing'
    },
    onboarding: {
        title: routesTitles.onboarding,
        path: '/onboarding'
    },
    app: {
        title: routesTitles.app,
        path: `/`
    },
    faqs: {
        title: routesTitles.faqs.title,
        path: `/faqs`,
        routes: {
            questions: {
                title: routesTitles.faqs.routes.questions,
                path: `/faqs/questions`
            },
            answers: {
                title: routesTitles.faqs.routes.answers,
                path: `/faqs/answers`
            }
        }
    },
    settings: {
        title: routesTitles.settings,
        path: `/settings`
    },
    chatClient: {
        path: `/au`
    },
    chatUser: {
        title: routesTitles.chatUser,
        path: `/chats`
    },
    chatUserIndividual: {
        title: routesTitles.chatUserIndividual,
        path: `/chats/chat`
    }
};
