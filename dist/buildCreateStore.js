"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildCreateStore;

var _redux = require("redux");

function buildCreateStore(reducer, initial, middleware, actions) {
  return () => {
    const store = (0, _redux.createStore)(reducer, initial, (0, _redux.applyMiddleware)(middleware));

    for (let a in actions) {
      store.dispatch[a] = (...args) => {
        store.dispatch(actions[a](...args));
      };
    }

    return store;
  };
}

;