import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

import gridReducer from '../../Home/redux/index';

const rootReducer = combineReducers({
  ...gridReducer,
});

let enhancer;
if (process.env.NODE_ENV === 'production') {
  enhancer = compose(
    applyMiddleware(thunkMiddleware)
  );
} else {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(
    applyMiddleware(
      thunkMiddleware
    )
  );
}

const appStore = createStore(rootReducer, enhancer);

export default appStore;