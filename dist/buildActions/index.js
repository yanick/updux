"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = __importDefault(require("lodash/fp"));
function actionFor(type) {
    const creator = ((payload = undefined, meta = undefined) => fp_1.default.pickBy(v => v !== undefined)({ type, payload, meta }));
    creator._genericAction = true;
    return creator;
}
function buildActions(generators = {}, actionNames = [], subActions = []) {
    const [crafted, generic] = fp_1.default.partition(([type, f]) => !f._genericAction)(subActions);
    const actions = [
        ...(actionNames.map(type => [type, actionFor(type)])),
        ...generic,
        ...crafted,
        ...Object.entries(generators).map(([type, payload]) => [type, (...args) => ({ type, payload: payload(...args) })]),
    ];
    return fp_1.default.fromPairs(actions);
}
exports.default = buildActions;
//# sourceMappingURL=index.js.map