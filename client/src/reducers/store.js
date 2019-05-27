/**
 * TIP: Creates a Redux store that holds the complete state tree of your app.
There should only be a single store in your app.

 * IMPORTANT: Don't use this method with Server Side Rendering. If
 * your app is using SSR, and you do this, you’ll end up with a
 * SINGLE store for all of your users. Almost definitely not what you want.
 * More info:
 * https://daveceddia.com/access-redux-store-outside-react/
 * https://github.com/reduxjs/redux/issues/1436#issuecomment-187646474
 */
import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';

import reducers from './index';

let enhancer = compose;

if (process.env.NODE_ENV !== 'production')
    // Link Redux to its Chrome extension to debug.
    enhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    reducers,
    // Preloaded state is the initial state of app.
    {},
    // Inspect whatever value we return from the Action Creator with the dispatch function.
    enhancer(applyMiddleware(reduxThunk))
);

// Hot Reloading
if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./index', () => store.replaceReducer(reducers));
}

export default store;
