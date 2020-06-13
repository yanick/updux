"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
test('actions from mutations', () => {
    const { actions: { foo, bar }, } = _1.default({
        mutations: {
            foo: () => (x) => x,
        },
    });
    expect(foo()).toEqual({ type: 'foo' });
    expect(foo(true)).toEqual({ type: 'foo', payload: true });
    expect(foo({ bar: 2 }, { timestamp: 613 })).toEqual({
        type: 'foo',
        payload: { bar: 2 },
        meta: { timestamp: 613 },
    });
});
test('reducer', () => {
    const { actions, reducer } = _1.default({
        initial: { counter: 1 },
        mutations: {
            inc: () => ({ counter }) => ({ counter: counter + 1 }),
        },
    });
    let state = reducer(null, { type: 'noop' });
    expect(state).toEqual({ counter: 1 });
    state = reducer(state, actions.inc());
    expect(state).toEqual({ counter: 2 });
});
test('sub reducers', () => {
    const foo = _1.default({
        initial: 1,
        mutations: {
            doFoo: () => (x) => x + 1,
            doAll: () => (x) => x + 10,
        },
    });
    const bar = _1.default({
        initial: 'a',
        mutations: {
            doBar: () => (x) => x + 'a',
            doAll: () => (x) => x + 'b',
        }
    });
    const { initial, actions, reducer } = _1.default({
        subduxes: {
            foo, bar
        }
    });
    expect(initial).toEqual({ foo: 1, bar: 'a' });
    expect(Object.keys(actions)).toHaveLength(3);
    let state = reducer(null, { type: 'noop' });
    expect(state).toEqual({ foo: 1, bar: 'a' });
    state = reducer(state, actions.doFoo());
    expect(state).toEqual({ foo: 2, bar: 'a' });
    state = reducer(state, actions.doBar());
    expect(state).toEqual({ foo: 2, bar: 'aa' });
    state = reducer(state, actions.doAll());
    expect(state).toEqual({ foo: 12, bar: 'aab' });
});
test('precedence between root and sub-reducers', () => {
    const { initial, reducer, actions, } = _1.default({
        initial: {
            foo: { bar: 4 },
        },
        mutations: {
            inc: () => (state) => {
                return {
                    ...state,
                    surprise: state.foo.bar
                };
            }
        },
        subduxes: {
            foo: _1.default({
                initial: {
                    bar: 2,
                    quux: 3,
                },
                mutations: {
                    inc: () => (state) => ({ ...state, bar: state.bar + 1 })
                },
            }),
        }
    });
    expect(initial).toEqual({
        foo: { bar: 4, quux: 3 }
    });
    expect(reducer(null, actions.inc())).toEqual({
        foo: { bar: 5, quux: 3 }, surprise: 5
    });
});
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
test('middleware', async () => {
    const { middleware, createStore } = _1.default({
        initial: "",
        mutations: {
            inc: (addition) => (state) => state + addition,
            doEeet: () => (state) => {
                return state + 'Z';
            },
        },
        effects: {
            doEeet: api => next => async (action) => {
                api.dispatch.inc('a');
                next(action);
                await timeout(1000);
                api.dispatch.inc('c');
            }
        },
        subduxes: {
            foo: _1.default({
                effects: {
                    doEeet: (api) => next => action => {
                        api.dispatch({ type: 'inc', payload: 'b' });
                        next(action);
                    }
                }
            }),
        }
    });
    const store = createStore();
    store.dispatch.doEeet();
    expect(store.getState()).toEqual('abZ');
    await timeout(1000);
    expect(store.getState()).toEqual('abZc');
});
//# sourceMappingURL=test.js.map