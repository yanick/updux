"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
test('simple effect', () => {
    const tracer = jest.fn();
    const store = _1.default({
        effects: {
            foo: (api) => (next) => (action) => {
                tracer();
                next(action);
            },
        },
    }).createStore();
    expect(tracer).not.toHaveBeenCalled();
    store.dispatch({ type: 'bar' });
    expect(tracer).not.toHaveBeenCalled();
    store.dispatch.foo();
    expect(tracer).toHaveBeenCalled();
});
test('effect and sub-effect', () => {
    const tracer = jest.fn();
    const tracerEffect = (signature) => (api) => (next) => (action) => {
        tracer(signature);
        next(action);
    };
    const store = _1.default({
        effects: {
            foo: tracerEffect('root'),
        },
        subduxes: {
            zzz: _1.default({ effects: {
                    foo: tracerEffect('child'),
                } })
        },
    }).createStore();
    expect(tracer).not.toHaveBeenCalled();
    store.dispatch({ type: 'bar' });
    expect(tracer).not.toHaveBeenCalled();
    store.dispatch.foo();
    expect(tracer).toHaveBeenNthCalledWith(1, 'root');
    expect(tracer).toHaveBeenNthCalledWith(2, 'child');
});
test('"*" effect', () => {
    const tracer = jest.fn();
    const store = _1.default({
        effects: {
            '*': api => next => action => {
                tracer();
                next(action);
            },
        },
    }).createStore();
    expect(tracer).not.toHaveBeenCalled();
    store.dispatch({ type: 'bar' });
    expect(tracer).toHaveBeenCalled();
});
test('async effect', async () => {
    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    const tracer = jest.fn();
    const store = _1.default({
        effects: {
            foo: api => next => async (action) => {
                next(action);
                await timeout(1000);
                tracer();
            },
        },
    }).createStore();
    expect(tracer).not.toHaveBeenCalled();
    store.dispatch.foo();
    expect(tracer).not.toHaveBeenCalled();
    await timeout(1000);
    expect(tracer).toHaveBeenCalled();
});
//# sourceMappingURL=middleware.test.js.map