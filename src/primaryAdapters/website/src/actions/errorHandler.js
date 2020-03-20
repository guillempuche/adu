/**
 * App error handler to dispatch the errors.
 */
import * as types from './types';

/**
 *
 * @param {Object} err The error throwed.
 * @param {string} type Category of the error.
 * @param {function} dispatch
 * @param {} [data] Data to process.
 */
const error = (err, type, dispatch) => {
    if (err.response && err.response.status >= 400) {
        if (type === 'chatFatalError')
            return dispatch({
                type: types.ERROR_CHAT_FATAL,
                payload: err
            });
    } else {
        if (type === 'chatFatalError')
            return dispatch({
                type: types.ERROR_CHAT_FATAL,
                payload: err
            });
    }

    return dispatch({
        type: types.ERROR,
        payload: err
    });
};

export default error;
