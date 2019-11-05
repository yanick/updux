"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = __importDefault(require("lodash/fp"));
const mobx_1 = require("mobx");
const buildActions_1 = __importDefault(require("./buildActions"));
const buildInitial_1 = __importDefault(require("./buildInitial"));
const buildMutations_1 = __importDefault(require("./buildMutations"));
const buildCreateStore_1 = __importDefault(require("./buildCreateStore"));
const buildMiddleware_1 = __importDefault(require("./buildMiddleware"));
const buildUpreducer_1 = __importDefault(require("./buildUpreducer"));
var buildActions_2 = require("./buildActions");
exports.actionCreator = buildActions_2.actionCreator;
class Updux {
    constructor(config = {}) {
        this.groomMutations = config.groomMutations || ((x) => x);
        this.subduxes = fp_1.default.mapValues((value) => fp_1.default.isPlainObject(value) ? new Updux(value) : value)(fp_1.default.getOr({}, 'subduxes', config));
        this.localActions = fp_1.default.getOr({}, 'actions', config);
        this.localEffects = fp_1.default.getOr({}, 'effects', config);
        this.initial = buildInitial_1.default(config.initial, fp_1.default.mapValues(({ initial }) => initial)(this.subduxes));
        this.localMutations = fp_1.default.mapValues((m) => this.groomMutations(m))(fp_1.default.getOr({}, 'mutations', config));
    }
    get middleware() {
        return buildMiddleware_1.default(this.localEffects, this.actions, Object.values(this.subduxes).map(sd => sd.middleware));
    }
    get actions() {
        return buildActions_1.default(this.localActions, [...Object.keys(this.localMutations), ...Object.keys(this.localEffects)], fp_1.default.flatten(Object.values(this.subduxes).map(({ actions }) => Object.entries(actions))));
    }
    get upreducer() {
        return buildUpreducer_1.default(this.initial, this.mutations);
    }
    get reducer() {
        return (state, action) => this.upreducer(action)(state);
    }
    get mutations() {
        return buildMutations_1.default(this.localMutations, this.subduxes);
    }
    get createStore() {
        const actions = this.actions;
        return buildCreateStore_1.default(this.reducer, this.initial, this.middleware, this.actions);
    }
    get asDux() {
        return {
            createStore: this.createStore,
            upreducer: this.upreducer,
            subduxes: this.subduxes,
            middleware: this.middleware,
            actions: this.actions,
            reducer: this.reducer,
            mutations: this.mutations,
            initial: this.initial,
        };
    }
    addMutation(creator, mutation) {
        this.localActions[creator.type] = creator;
        this.localMutations[creator.type] = this.groomMutations(mutation);
    }
}
__decorate([
    mobx_1.observable
], Updux.prototype, "localEffects", void 0);
__decorate([
    mobx_1.observable
], Updux.prototype, "localActions", void 0);
__decorate([
    mobx_1.observable
], Updux.prototype, "localMutations", void 0);
__decorate([
    mobx_1.computed
], Updux.prototype, "middleware", null);
__decorate([
    mobx_1.computed
], Updux.prototype, "actions", null);
__decorate([
    mobx_1.computed
], Updux.prototype, "upreducer", null);
__decorate([
    mobx_1.computed
], Updux.prototype, "reducer", null);
__decorate([
    mobx_1.computed
], Updux.prototype, "mutations", null);
__decorate([
    mobx_1.computed
], Updux.prototype, "createStore", null);
exports.Updux = Updux;
exports.default = Updux;
//# sourceMappingURL=updux.js.map