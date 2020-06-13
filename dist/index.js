"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = updux;

var _fp = _interopRequireDefault(require("lodash/fp"));

var _updeep = _interopRequireDefault(require("updeep"));

var _updux = _interopRequireDefault(require("./updux"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updux(config) {
  return new _updux.default(config);
}