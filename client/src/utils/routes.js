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
    landing: {
        title: routesTitles.landing,
        path: '/landing'
    },
    login: {
        title: routesTitles.login,
        path: '/login' // IMPORTANT: Same pathname at server keys.
    },
    auth: {
        path: '/auth' // IMPORTANT: Same pathname at server authRoute.js
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
        title: routesTitles.faqs,
        path: `/faqs`
    },
    settings: {
        title: routesTitles.settings,
        path: `/settings`
    },
    logout: {
        path: '/api/logout' // Same oathname at server authRoute.js
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
