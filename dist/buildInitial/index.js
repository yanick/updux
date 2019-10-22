"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildInitial;

var _fp = _interopRequireDefault(require("lodash/fp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildInitial(initial = {}, subduxes = {}) {
  return _fp.default.isPlainObject(initial) ? _fp.default.mergeAll([subduxes, initial]) : initial;
}