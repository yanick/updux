import Updux from '.';

test('actions from mutations', () => {
  const {
    actions: {foo, bar},
  } = new Updux({
    mutations: {
      foo: () => (x:any) => x,
    },
  });

  expect(foo()).toEqual({type: 'foo'});

  expect(foo(true)).toEqual({type: 'foo', payload: true});

});

test('reducer', () => {
  const {actions, reducer} = new Updux({
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
    const foo = new Updux({
        initial: 1,
        mutations: {
            doFoo: () => (x:number) => x + 1,
            doAll: () => (x:number) => x + 10,
        },
    });

    const bar = new Updux({
        initial: 'a',
        mutations: {
            doBar: () => (x:string) => x + 'a',
            doAll: () => (x:string) => x + 'b',
        }
    });

    const { initial, actions, reducer } = new Updux({
        subduxes: {
            foo, bar
        }
    });

    expect(initial).toEqual({ foo: 1, bar: 'a' });

    expect(Object.keys(actions)).toHaveLength(3);

    let state = reducer(undefined,{type:'noop'});

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
    } = new Updux({
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
            foo: {
                initial: {
                    bar: 2,
                    quux: 3,
                },
                mutations: {
                    inc: () => (state:any) => ({...state, bar: state.bar + 1 })
                },
            },
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
    } = new Updux({
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
            foo: {
                effects: {
                    doEeet: (api:any) => ( next:any ) => ( action: any ) => {
                        api.dispatch({ type: 'inc', payload: 'b'});
                        next(action);
                    }
                }
            },
        }
    });

    const store = createStore();

    store.dispatch.doEeet();

    expect(store.getState()).toEqual( 'abZ' );

    await timeout(1000);

    expect(store.getState()).toEqual( 'abZc' );

});


test( "subduxes and mutations", () => {
    const foo = new Updux({ mutations: {
        quux: () => () => 'x',
        blart: () => () => 'a',
    }});
    const bar = new Updux({ mutations: {
        quux: () => () => 'y'
    }});
    const baz = new Updux({
        mutations: {
        quux: () => (state:any) => ({...state, "baz": "z" })
    }, subduxes: { foo, bar } });

    let state = baz.reducer(undefined, baz.actions.quux() );

    expect(state).toEqual({
        foo: "x",
        bar: "y",
        baz: "z",
    });

});
