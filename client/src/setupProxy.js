/**
 * You do not need to import this file anywhere. It is automatically
 * registered when you start the development server.
 *
 * More info: https://facebook.github.io/create-react-app/docs/proxying-api-requests-in-development#configuring-the-proxy-manually
 */
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        proxy('/auth', {
            target: 'http://localhost:5000',
            changeOrigin: true,
            logLevel: 'debug'
        })
    );
    app.use(
        proxy('/api', {
            target: 'http://localhost:5000',
            // The snippet is used to solve ECONNREFUSED on development.
            secure: false,
            changeOrigin: true
            //logLevel: 'debug'
        })
    );
};
