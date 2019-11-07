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
function sliceMw(slice, mw) {
    return (api) => {
        const getSliceState = () => fp_1.default.get(slice, api.getState());
        const getRootState = api.getRootState || api.getState;
        return mw({ ...api, getState: getSliceState, getRootState });
    };
}
function buildMiddleware(effects = {}, actions = {}, subduxes = {}) {
    const subMiddlewares = fp_1.default.flow(fp_1.default.mapValues(fp_1.default.get('middleware')), fp_1.default.toPairs, fp_1.default.filter(x => x[1]), fp_1.default.map(([slice, mw]) => sliceMw(slice, mw)))(subduxes);
    return (api) => {
        for (let type in actions) {
            const ac = actions[type];
            api.dispatch[type] = (...args) => api.dispatch(ac(...args));
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