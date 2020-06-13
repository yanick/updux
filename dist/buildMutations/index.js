"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = __importDefault(require("lodash/fp"));
const updeep_1 = __importDefault(require("updeep"));
const composeMutations = (mutations) => mutations.reduce((m1, m2) => (payload = null, action) => state => m2(payload, action)(m1(payload, action)(state)));
function buildMutations(mutations = {}, subduxes = {}) {
    const actions = fp_1.default.uniq(Object.keys(mutations).concat(...Object.values(subduxes).map(({ mutations = {} }) => Object.keys(mutations))));
    let mergedMutations = {};
    let [globby, nonGlobby] = fp_1.default.partition(([_, { mutations = {} }]) => mutations['*'], Object.entries(subduxes));
    globby = fp_1.default.flow([
        fp_1.default.fromPairs,
        fp_1.default.mapValues(({ reducer }) => (_, action) => (state) => reducer(state, action)),
    ])(globby);
    const globbyMutation = (payload, action) => updeep_1.default(fp_1.default.mapValues((mut) => mut(payload, action))(globby));
    actions.forEach(action => {
        mergedMutations[action] = [globbyMutation];
    });
    nonGlobby.forEach(([slice, { mutations = {}, reducer = {} }]) => {
        Object.entries(mutations).forEach(([type, mutation]) => {
            const localized = (payload = null, action) => updeep_1.default.updateIn(slice)(mutation(payload, action));
            mergedMutations[type].push(localized);
        });
    });
    Object.entries(mutations).forEach(([type, mutation]) => {
        mergedMutations[type].push(mutation);
    });
    return fp_1.default.mapValues(composeMutations)(mergedMutations);
}
exports.default = buildMutations;
//# sourceMappingURL=index.js.map