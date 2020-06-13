"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Updux = void 0;

var _fp = _interopRequireDefault(require("lodash/fp"));

var _buildActions = _interopRequireDefault(require("./buildActions"));

var _buildInitial = _interopRequireDefault(require("./buildInitial"));

var _buildMutations = _interopRequireDefault(require("./buildMutations"));

var _buildCreateStore = _interopRequireDefault(require("./buildCreateStore"));

var _buildMiddleware = _interopRequireDefault(require("./buildMiddleware"));

var _buildUpreducer = _interopRequireDefault(require("./buildUpreducer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Updux {
  constructor(config) {
    this.subduxes = _fp.default.mapValues(value => _fp.default.isPlainObject(value) ? new Updux(value) : value)(_fp.default.getOr({}, 'subduxes', config));
    this.actions = (0, _buildActions.default)(config.actions, config.mutations, config.effects, Object.values(this.subduxes).map(({
      actions
    }) => actions));
    this.initial = (0, _buildInitial.default)(config.initial, _fp.default.mapValues(({
      initial
    }) => initial)(this.subduxes));
    this.mutations = (0, _buildMutations.default)(config.mutations, this.subduxes);
    this.upreducer = (0, _buildUpreducer.default)(this.initial, this.mutations);

    this.reducer = (state, action) => {
      return this.upreducer(action)(state);
    };

    this.middleware = (0, _buildMiddleware.default)(config.effects, this.actions, config.subduxes);
    this.createStore = (0, _buildCreateStore.default)(this.reducer, this.initial, this.middleware, this.actions);
  }

}

exports.Updux = Updux;
var _default = Updux;
exports.default = _default;