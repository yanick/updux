"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildUpreducer;

var _fp = _interopRequireDefault(require("lodash/fp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildUpreducer(initial, mutations) {
  return (action = {}) => state => {
    if (state === null) state = initial;
    const a = mutations[action.type] || mutations['*'];
    if (!a) return state;
    return a(action.payload, action)(state);
  };
}