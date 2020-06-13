import u from 'updeep';
import { action } from 'ts-action';
import tap from 'tap';
import sinon from 'sinon';

import Updux, { dux, subEffects } from '.';
import mwUpdux from './middleware_aux';

tap.test('simple effect', async t => {
    const tracer = sinon.fake();

    const store = new Updux({
        effects: {
            foo: () => (next: any) => (action: any) => {
                tracer();
                next(action);
            },
        },
    }).createStore();

    t.ok(!tracer.called);

    store.dispatch({ type: 'bar' });

    t.ok(!tracer.called);

    store.dispatch( (store as any).actions.foo() );

    t.ok(tracer.called);
});

tap.test('effect and sub-effect', async t => {
    const tracer = sinon.fake();

    const tracerEffect = (signature: string) => () => (next: any) => (
        action: any
    ) => {
        tracer(signature);
        next(action);
    };

    const store = new Updux({
        effects: {
            foo: tracerEffect('root'),
        },
        subduxes: {
            zzz: dux({
                effects: {
                    foo: tracerEffect('child'),
                },
            }),
        },
    }).createStore();

    t.ok(!tracer.called);

    store.dispatch({ type: 'bar' });

    t.ok(!tracer.called);

    store.dispatch( (store.actions as any).foo() );

    t.is( tracer.firstCall.lastArg, 'root' );
    t.is( tracer.secondCall.lastArg, 'child' );
});

tap.test('"*" effect', async t => {
    t.test('from the constructor', async t => {
    const tracer = sinon.fake();

        const store = new Updux({
            effects: {
                '*': () => next => action => {
                    tracer();
                    next(action);
                },
            },
        }).createStore();

        t.ok(!tracer.called);

        store.dispatch({ type: 'bar' });
        t.ok(tracer.called);

    });

    t.test('from addEffect', async t => {
    const tracer = sinon.fake();

        const updux = new Updux({});

        updux.addEffect('*', () => next => action => {
            tracer();
            next(action);
        });

        t.ok(!tracer.called);

        updux.createStore().dispatch({ type: 'bar' });

        t.ok(tracer.called);
    });

    t.test('action can be modified', async t => {

        const mw = mwUpdux.middleware;

    const next = sinon.fake();

        mw({dispatch:{}} as any)(next as any)({type: 'bar'});

        t.ok(next.called);
        t.match( next.firstCall.args[0], {meta: 'gotcha' } );
    });
});

tap.test('async effect', async t => {
    function timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const tracer = sinon.fake();

    const store = new Updux({
        effects: {
            foo: () => next => async action => {
                next(action);
                await timeout(1000);
                tracer();
            },
        },
    }).createStore();

    t.ok(!tracer.called);

    store.dispatch( (store.actions as any).foo() );

    t.ok(!tracer.called);

    await timeout(1000);

    t.ok(tracer.called);
});

tap.test('getState is local', async t => {
    let childState;
    let rootState;

    const child = new Updux({
        initial: { alpha: 12 },
        effects: {
            doIt: ({ getState }) => next => action => {
                childState = getState();
                next(action);
            },
        },
    });

    const root = new Updux({
        initial: { beta: 24 },
        subduxes: { child: child.asDux },
        effects: {
            doIt: ({ getState }) => next => action => {
                rootState = getState();
                next(action);
            },
        },
    });

    const store = root.createStore();
    store.dispatch( (store.actions as any).doIt() );

    t.match(rootState,{ beta: 24, child: { alpha: 12 } });
    t.match(childState,{ alpha: 12 });
});

tap.test('middleware as map', async t => {

    const doIt = action('doIt', () => ({payload: ''}));

    const child = new Updux({
        initial: '',
        effects: [
            [
                doIt,
                () => next => action => {
                    next(
                        u(
                            { payload: (p: string) => p + 'Child' },
                            action
                        ) as any
                    );
                },
            ],
        ],
    });


    const root = new Updux({
        initial: { message: '' },
        subduxes: { child: child.asDux },
        effects: [
            [
                '*',
                () => next => action => {
                    next(
                        u({ payload: (p: string) => p + 'Pre' }, action) as any
                    );
                },
            ],
            [
                doIt,
                () => next => action => {
                    next(
                        u({ payload: (p: string) => p + 'Root' }, action) as any
                    );
                },
            ],
            [
                '*',
                () => next => action => {
                    next(
                        u(
                            { payload: (p: string) => p + 'After' },
                            action
                        ) as any
                    );
                },
            ],
            subEffects,
            [
                '*',
                () => next => action => {
                    next(
                        u({ payload: (p: string) => p + 'End' }, action) as any
                    );
                },
            ],
        ],
        mutations: [[doIt, (message: any) => () => ({ message })]],
    });

    const store = root.createStore();
    const actions: any = store.actions;
    store.dispatch( actions.doIt('') );

    t.same(store.getState(),{ message: 'PreRootAfterChildEnd' });
});

tap.test('generator', async t => {
    const updux = new Updux({
        initial: 0,
        mutations: [['doIt', payload => () => payload]],
        effects: [
            [
                'doIt',
                () => {
                    let i = 0;
                    return () => (next: any) => (action: any) =>
                        next({ ...action, payload: ++i });
                },
                true,
            ],
        ],
    });

    const store1 = updux.createStore();
    store1.dispatch( (store1 as any).actions.doIt() );

    t.is(store1.getState(),1);
    store1.dispatch( (store1 as any).actions.doIt() );

    t.is(store1.getState(),2);

    const store2 = updux.createStore();
    store2.dispatch( (store2 as any).actions.doIt() );
    t.is(store2.getState(),1);
});
