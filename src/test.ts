import Updux, {dux} from '.';
import u from 'updeep';
import { action, payload } from 'ts-action';
import tap from 'tap';

tap.test('actions from mutations', async t => {
  const {
    actions: {foo, bar},
  } : any = new Updux({
    mutations: {
      foo: () => (x:any) => x,
    },
  });

  t.match( foo(), { type: 'foo' } );
  t.same( foo(true), {type: 'foo', payload: true});

});

tap.test('reducer', async t => {
  const inc = action('inc');
  const {actions, reducer} = dux({
    initial: {counter: 1},
    actions: { inc },
    mutations: {
      inc: () => ({counter}:{counter:number}) => ({counter: counter + 1}),
    },
  });

  let state = reducer(undefined, {type:'noop'});

  t.same(state,{counter: 1});

  state = reducer(state, actions.inc());

  t.same(state,{counter: 2});
});

tap.test( 'sub reducers', async t => {
    const doAll = action('doAll', payload<number>() );

    const foo = dux({
        initial: 1,
        actions: { doAll },
        mutations: {
            doFoo: () => (x:number) => x + 1,
            doAll: () => (x:number) => x + 10,
        },
    });

    const bar = dux({
        initial: 'a',
        actions: { doAll },
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

    t.same(initial,{ foo: 1, bar: 'a' });

    t.is(Object.keys(actions).length,3);

    let state = reducer(undefined,{type:'noop'});

    t.same(state,{ foo: 1, bar: 'a' });

    state = reducer(state, (actions as any).doFoo() );

    t.same(state,{ foo: 2, bar: 'a' });

    state = reducer(state, (actions as any).doBar() );

    t.same(state,{ foo: 2, bar: 'aa' });

    state = reducer(state, (actions as any).doAll() );

    t.same(state,{ foo: 12, bar: 'aab' });

});

tap.test('precedence between root and sub-reducers', async t => {
    const {
        initial,
        reducer,
        actions,
    } =  dux({
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
            foo: dux({
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

    // quick fix until https://github.com/facebook/jest/issues/9531
    t.same(initial,{
        foo: { bar: 4, quux: 3 }
    });

    t.same( reducer(undefined,(actions as any).inc() ) ,{
        foo: { bar: 5, quux: 3 }, surprise: 5
    });

});

function timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

tap.test( 'middleware', async t => {
    const {
        middleware,
        createStore,
        actions,
    } = dux({
        initial: { result: [] },
        mutations: {
            inc: (addition:number) => u({ result: r => [ ...r, addition ]}),
            doEeet: () => u({ result: r => [ ...r, 'Z' ]}),
        },
        effects: {
            doEeet: api => next => async action => {
                api.dispatch( api.actions.inc('a') );
                next(action);
                await timeout(1000);
                api.dispatch( api.actions.inc('c') );
            }
        },
        subduxes: {
            foo: dux({
                effects: {
                    doEeet: (api:any) => ( next:any ) => ( action: any ) => {
                        api.dispatch({ type: 'inc', payload: 'b'});
                        next(action);
                    }
                }
            }),
        }
    });

    const store :any = createStore();

    store.dispatch( (actions as any).doEeet() );

    t.is(store.getState().result.join(''),'abZ' );

    await timeout(1000);

    t.is(store.getState().result.join(''), 'abZc' );

});


tap.test( "subduxes and mutations", async t => {
    const quux = action('quux');

    const foo = dux({
        actions: { quux },
        mutations: {
        quux: () => () => 'x',
        blart: () => () => 'a',
    }});
    const bar = dux({
        actions: { quux },
        mutations: {
        quux: () => () => 'y'
    }});
    const baz = dux({
        actions: { quux },
        mutations: {
        quux: () => (state:any) => ({...state, "baz": "z" })
    }, subduxes: { foo, bar } });

    let state = baz.reducer(undefined, (baz.actions as any).quux() );

    t.same(state,{
        foo: "x",
        bar: "y",
        baz: "z",
    });

});
