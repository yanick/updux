"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_1 = require("redux");
function buildCreateStore(reducer, initial, middleware, actions) {
    return () => {
        const store = redux_1.createStore(reducer, initial, redux_1.applyMiddleware(middleware));
        for (let a in actions) {
            store.dispatch[a] = (...args) => {
                store.dispatch(actions[a](...args));
            };
        }
        return store;
    };
}
exports.default = buildCreateStore;
//# sourceMappingURL=index.js.map