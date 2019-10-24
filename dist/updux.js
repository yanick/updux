"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = __importDefault(require("lodash/fp"));
const buildActions_1 = __importDefault(require("./buildActions"));
const buildInitial_1 = __importDefault(require("./buildInitial"));
const buildMutations_1 = __importDefault(require("./buildMutations"));
const buildCreateStore_1 = __importDefault(require("./buildCreateStore"));
const buildMiddleware_1 = __importDefault(require("./buildMiddleware"));
const buildUpreducer_1 = __importDefault(require("./buildUpreducer"));
class Updux {
    constructor(config) {
        this.subduxes = fp_1.default.mapValues((value) => fp_1.default.isPlainObject(value) ? new Updux(value) : value)(fp_1.default.getOr({}, 'subduxes', config));
        this.actions = buildActions_1.default(config.actions, [...Object.keys(config.mutations || {}), ...Object.keys(config.effects || {})], fp_1.default.flatten(Object.values(this.subduxes).map(({ actions }) => Object.entries(actions))));
        this.initial = buildInitial_1.default(config.initial, fp_1.default.mapValues(({ initial }) => initial)(this.subduxes));
        this.mutations = buildMutations_1.default(config.mutations, this.subduxes);
        this.upreducer = buildUpreducer_1.default(this.initial, this.mutations);
        this.reducer = (state, action) => {
            return this.upreducer(action)(state);
        };
        this.middleware = buildMiddleware_1.default(config.effects, this.actions, Object.values(this.subduxes).map(sd => sd.middleware));
        const actions = this.actions;
        this.createStore = buildCreateStore_1.default(this.reducer, this.initial, this.middleware, this.actions);
    }
}
exports.Updux = Updux;
exports.default = Updux;
//# sourceMappingURL=updux.js.map