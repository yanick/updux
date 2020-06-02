import { action, empty } from 'ts-action';
import Updux, { dux } from '.';
import tap from 'tap';

import u from 'updeep';

tap.test('as array of arrays', async t => {
    const doIt = action('doIt');

    const updux = new Updux({
        initial: '',
        actions: { doIt },
        mutations: [
            [doIt, () => () => 'bingo'],
            ['thisToo', () => () => 'straight type'],
        ],
    });

    const store = updux.createStore();

    t.test('doIt', async t => {
        store.dispatch( store.actions.doIt() );
        t.is(store.getState(),'bingo');
    });

    t.test('straight type', async t => {
        store.dispatch( (store.actions as any).thisToo() );
        t.is(store.getState(),'straight type');
    });
});

tap.test('override', async t => {
    const d = new Updux<any>({
        initial: { alpha: [] },
        mutations: {
            '*': (payload, action) => state => ({
                ...state,
                alpha: [...state.alpha, action.type],
            }),
        },
        subduxes: {
            subbie: dux({
                initial: 0,
                mutations: {
                    foo: () => state => state + 1,
                },
            }),
        },
    });

    const store = d.createStore();
    store.dispatch({ type: 'foo' });
    store.dispatch({ type: 'bar' });

    t.pass();
});

tap.test('coduxes and subduxes', async t => {
    const foo = action('foo',empty());

    const d = new Updux({
        initial: {
            x: '',
        },
        actions: {
            foo
        },
        mutations: [[foo, () => (u.updateIn as any)('x', x => x + 'm')]],
        subduxes: {
            x: dux({
                mutations: [[foo, () => x => x + 's']],
            }),
        },
        coduxes: [
            dux({
                mutations: [[foo, () => (u.updateIn as any)('x', x => x + 'c')]],
            }),
        ],
    });

    const store = d.createStore();

    store.dispatch(d.actions.foo());

    t.same(store.getState(),{
        x: 'scm',
    });
});
