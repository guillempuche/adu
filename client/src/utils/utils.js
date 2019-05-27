import ROUTES from './routes';

/**
 * Check if the actual browser user is a client or not (it's a faculty's user)
 */
const isClientURL = () => {
    if (window.location.pathname === ROUTES.chatClient.path) return true;

    return false;
};

export { isClientURL };
