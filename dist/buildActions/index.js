"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = __importDefault(require("lodash/fp"));
function actionCreator(type, transform) {
    if (transform) {
        return Object.assign((...args) => ({ type, payload: transform(...args) }), { type });
    }
    if (transform === null) {
        return Object.assign(() => ({ type }), { type });
    }
    return Object.assign((payload) => ({ type, payload }));
}
exports.actionCreator = actionCreator;
function actionFor(type) {
    const f = ((payload = undefined, meta = undefined) => fp_1.default.pickBy(v => v !== undefined)({ type, payload, meta }));
    return Object.assign(f, {
        _genericAction: true,
        type
    });
}
function buildActions(generators = {}, actionNames = [], subActions = []) {
    const [crafted, generic] = fp_1.default.partition(([type, f]) => !f._genericAction)(subActions);
    const actions = [
        ...(actionNames.map(type => [type, actionFor(type)])),
        ...generic,
        ...crafted,
        ...Object.entries(generators).map(([type, payload]) => [type, payload.type ? payload : (...args) => ({ type, payload: payload(...args) })]),
    ];
    return fp_1.default.fromPairs(actions);
}
exports.default = buildActions;
//# sourceMappingURL=index.js.map