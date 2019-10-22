"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildActions;

var _fp = _interopRequireDefault(require("lodash/fp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function actionFor(type) {
  const creator = (payload = undefined, meta = undefined) => _fp.default.pickBy(v => v !== undefined)({
    type,
    payload,
    meta
  });

  creator._genericAction = true;
  return creator;
}

function buildActions(creators = {}, mutations = {}, effects = {}, subActions = []) {
  // priority => generics => generic subs => craft subs => creators
  const [crafted, generic] = _fp.default.partition(([type, f]) => !f._genericAction)(_fp.default.flatten(subActions.map(x => Object.entries(x))).filter(([_, f]) => f));

  const actions = [...[...Object.keys(mutations), ...Object.keys(effects)].map(type => [type, actionFor(type)]), ...generic, ...crafted, ...Object.entries(creators).map(([type, payload]) => [type, (...args) => ({
    type,
    payload: payload(...args)
  })])];
  return _fp.default.fromPairs(actions);
}