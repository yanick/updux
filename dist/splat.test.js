"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
const updeep_1 = __importDefault(require("updeep"));
const tracer = (chr) => updeep_1.default({ tracer: (s = '') => s + chr });
test('mutations, simple', () => {
    const dux = _1.default({
        mutations: {
            foo: () => tracer('a'),
            '*': () => tracer('b'),
        },
    });
    const store = dux.createStore();
    expect(store.getState()).toEqual({ tracer: 'b' });
    store.dispatch.foo();
    expect(store.getState()).toEqual({ tracer: 'ba', });
    store.dispatch({ type: 'bar' });
    expect(store.getState()).toEqual({ tracer: 'bab', });
});
test('with subduxes', () => {
    const dux = _1.default({
        mutations: {
            foo: () => tracer('a'),
            '*': () => tracer('b'),
            bar: () => ({ bar }) => ({ bar, tracer: bar.tracer })
        },
        subduxes: {
            bar: _1.default({
                mutations: {
                    foo: () => tracer('d'),
                    '*': () => tracer('e'),
                },
            }),
        },
    });
    const store = dux.createStore();
    expect(store.getState()).toEqual({
        tracer: 'b',
        bar: { tracer: 'e' }
    });
    store.dispatch.foo();
    expect(store.getState()).toEqual({
        tracer: 'ba',
        bar: { tracer: 'ed' }
    });
    store.dispatch({ type: 'bar' });
    expect(store.getState()).toEqual({
        tracer: 'ede',
        bar: { tracer: 'ede' }
    });
});
//# sourceMappingURL=splat.test.js.map