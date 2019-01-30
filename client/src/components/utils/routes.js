/**
 * A module that exports all the urls.
 * @module ROUTES
 */

const ROOT = 'app';

exports.ROUTES = {
    landing: {
        title: 'Landing',
        path: '/'
    },
    login: {
        title: 'Login',
        path: '/login'
    },
    app: {
        title: 'App',
        path: `/${ROOT}`
    },
    chat: {
        title: 'Consultas',
        path: `/${ROOT}/consultas`
    },
    database: {
        title: 'Base de Datos',
        path: `/${ROOT}/database`
    },
    settings: {
        title: 'Configuración',
        path: `/${ROOT}/settings`
    }
};
