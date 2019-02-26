/**
 * A module that exports all the urls.
 * @module ROUTES
 */

const ROOT = '';

exports.ROUTES = {
    landing: {
        title: 'Landing',
        path: '/landing'
    },
    login: {
        title: 'Login',
        path: '/login' // Same pathname at server keys.
    },
    auth: {
        path: '/auth' // Same pathname at server authRoute.js
    },
    onboarding: {
        title: 'Entrar en la facultad',
        path: '/onboarding'
    },
    app: {
        title: 'App',
        path: `/`
    },
    chat: {
        title: 'Consultas',
        path: `/consultas`
    },
    database: {
        title: 'Base de Datos',
        path: `/database`
    },
    settings: {
        title: 'Configuración',
        path: `/settings`
    },
    logout: {
        path: '/api/logout' // Same oathname at server authRoute.js
    }
};
