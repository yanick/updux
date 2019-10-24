"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = __importDefault(require("lodash/fp"));
const MiddlewareFor = (type, mw) => api => next => action => {
    if (type !== '*' && action.type !== type)
        return next(action);
    return mw(api)(next)(action);
};
function buildMiddleware(effects = {}, actions = {}, subMiddlewares = []) {
    return (api) => {
        for (let type in actions) {
            api.dispatch[type] = (...args) => api.dispatch(actions[type](...args));
        }
        return (original_next) => {
            return [
                ...fp_1.default.toPairs(effects).map(([type, effect]) => MiddlewareFor(type, effect)),
                ...subMiddlewares
            ]
                .filter(x => x)
                .reduceRight((next, mw) => mw(api)(next), original_next);
        };
    };
}
exports.default = buildMiddleware;
//# sourceMappingURL=index.js.map