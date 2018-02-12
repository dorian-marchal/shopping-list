import { applyMiddleware, createStore } from 'redux';

import App from './App';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './reducer';
import serializeForDevtools from './lib/serializeForDevtools';
import thunk from 'redux-thunk';

const composeEnhancer = composeWithDevTools({
  serialize: { replacer: (key, value) => serializeForDevtools(value) },
});

const store = createStore(reducer, composeEnhancer(applyMiddleware(thunk)));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
