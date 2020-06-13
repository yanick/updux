"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildMiddleware;

var _fp = _interopRequireDefault(require("lodash/fp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MiddlewareFor = (type, mw) => api => next => action => {
  if (type !== '*' && action.type !== type) return next(action);
  return mw(api)(next)(action);
};

function buildMiddleware(effects = {}, actions = {}, subduxes = {}) {
  return api => {
    for (let type in actions) {
      api.dispatch[type] = (...args) => api.dispatch(actions[type](...args));
    }

    return original_next => {
      return [..._fp.default.toPairs(effects).map(([type, effect]) => MiddlewareFor(type, effect)), ..._fp.default.map('middleware', subduxes)].filter(x => x).reduceRight((next, mw) => mw(api)(next), original_next);
    };
  };
}