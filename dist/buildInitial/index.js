"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = __importDefault(require("lodash/fp"));
function buildInitial(initial = {}, subduxes = {}) {
    return fp_1.default.isPlainObject(initial) ? fp_1.default.mergeAll([subduxes, initial]) : initial;
}
exports.default = buildInitial;
//# sourceMappingURL=index.js.map