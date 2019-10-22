"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildMutations;

var _fp = _interopRequireDefault(require("lodash/fp"));

var _updeep = _interopRequireDefault(require("updeep"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const composeMutations = mutations => mutations.reduce((m1, m2) => (payload = null, action = {}) => state => m2(payload, action)(m1(payload, action)(state)));

function buildMutations(mutations = {}, subduxes = {}) {
  // we have to differentiate the subduxes with '*' than those
  // without, as the root '*' is not the same as any sub-'*'
  const actions = _fp.default.uniq(Object.keys(mutations).concat(...Object.values(subduxes).map(({
    mutations = {}
  }) => Object.keys(mutations))));

  let mergedMutations = {};

  let [globby, nonGlobby] = _fp.default.partition(([_, {
    mutations = {}
  }]) => mutations['*'], Object.entries(subduxes));

  globby = _fp.default.flow([_fp.default.fromPairs, _fp.default.mapValues(({
    reducer
  }) => (_, action = {}) => state => reducer(state, action))])(globby);

  const globbyMutation = (payload, action) => (0, _updeep.default)(_fp.default.mapValues(mut => mut(payload, action))(globby));

  actions.forEach(action => {
    mergedMutations[action] = [globbyMutation];
  });
  nonGlobby.forEach(([slice, {
    mutations = {},
    reducer = {}
  }]) => {
    Object.entries(mutations).forEach(([type, mutation]) => {
      const localized = (payload = null, action = {}) => _updeep.default.updateIn(slice)(mutation(payload, action));

      mergedMutations[type].push(localized);
    });
  });
  Object.entries(mutations).forEach(([type, mutation]) => {
    mergedMutations[type].push(mutation);
  });
  return _fp.default.mapValues(composeMutations)(mergedMutations);
}