import updux from '.';

test('actions from mutations', () => {
  const {
    actions: {foo, bar},
  } = updux({
    mutations: {
      foo: () => (x:any) => x,
    },
  });

  expect(foo()).toEqual({type: 'foo'});

  expect(foo(true)).toEqual({type: 'foo', payload: true});

  expect(foo({bar: 2}, {timestamp: 613})).toEqual({
    type: 'foo',
    payload: {bar: 2},
    meta: {timestamp: 613},
  });
});

test('reducer', () => {
  const {actions, reducer} = updux({
    initial: {counter: 1},
    mutations: {
      inc: () => ({counter}:{counter:number}) => ({counter: counter + 1}),
    },
  });

  let state = reducer(undefined, {type:'noop'});

  expect(state).toEqual({counter: 1});

  state = reducer(state, actions.inc());

  expect(state).toEqual({counter: 2});
});

test( 'sub reducers', () => {
    const foo = updux({
        initial: 1,
        mutations: {
            doFoo: () => (x:number) => x + 1,
            doAll: () => (x:number) => x + 10,
        },
    });

    const bar = updux({
        initial: 'a',
        mutations: {
            doBar: () => (x:string) => x + 'a',
            doAll: () => (x:string) => x + 'b',
        }
    });

    const { initial, actions, reducer } = updux({
        subduxes: {
            foo, bar
        }
    });

    expect(initial).toEqual({ foo: 1, bar: 'a' });

    expect(Object.keys(actions)).toHaveLength(3);

    let state = reducer(null,{type:'noop'});

    expect(state).toEqual({ foo: 1, bar: 'a' });

    state = reducer(state, actions.doFoo() );

    expect(state).toEqual({ foo: 2, bar: 'a' });

    state = reducer(state, actions.doBar() );

    expect(state).toEqual({ foo: 2, bar: 'aa' });

    state = reducer(state, actions.doAll() );

    expect(state).toEqual({ foo: 12, bar: 'aab' });

});

test('precedence between root and sub-reducers', () => {
    const {
        initial,
        reducer,
        actions,
    } = updux({
        initial: {
            foo: { bar: 4 },
        },
        mutations: {
            inc: () => (state:any) => {
                return {
                    ...state,
                    surprise: state.foo.bar
                }
            }
        },
        subduxes: {
            foo: updux({
                initial: {
                    bar: 2,
                    quux: 3,
                },
                mutations: {
                    inc: () => (state:any) => ({...state, bar: state.bar + 1 })
                },
            }),
        }
    });

    expect(initial).toEqual({
        foo: { bar: 4, quux: 3 }
    });

    expect( reducer(undefined,actions.inc() ) ).toEqual({
        foo: { bar: 5, quux: 3 }, surprise: 5
    });

});

function timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test( 'middleware', async () => {
    const {
        middleware,
        createStore
    } = updux({
        initial: "",
        mutations: {
            inc: (addition:number) => (state:number) => state + addition,
            doEeet: () => (state:number) => {
                return state + 'Z';
            },
        },
        effects: {
            doEeet: api => next => async action => {
                api.dispatch.inc('a');
                next(action);
                await timeout(1000);
                api.dispatch.inc('c');
            }
        },
        subduxes: {
            foo: updux({
                effects: {
                    doEeet: (api) => next => action => {
                        api.dispatch({ type: 'inc', payload: 'b'});
                        next(action);
                    }
                }
            }),
        }
    });

    const store = createStore();

    store.dispatch.doEeet();

    expect(store.getState()).toEqual( 'abZ' );

    await timeout(1000);

    expect(store.getState()).toEqual( 'abZc' );

});
