import tap from 'tap';
import Updux, {dux} from '.';
import u from 'updeep';
import { expectType } from 'tsd';

const tracer = (chr: string) => u({ tracer: (s = '') => s + chr });

tap.test('mutations, simple', t => {
    const dux : any = new Updux({
        mutations: {
            foo: () => tracer('a'),
            '*': () => tracer('b'),
        },
    });

    const store = dux.createStore();

    t.same(store.getState(),{ tracer: 'b' });

    store.dispatch( store.actions.foo() );

    t.same(store.getState(),{ tracer: 'ba' });

    store.dispatch({ type: 'bar' });

    t.same(store.getState(),{ tracer: 'bab' });

    t.end();
});

tap.test('with subduxes', t => {
    const d = dux({
        mutations: {
            foo: () => tracer('a'),
            '*': () => tracer('b'),
            bar: () => ({ bar }: any) => ({ bar, tracer: bar.tracer }),
        },
        subduxes: {
            bar: dux({
                mutations: {
                    foo: () => tracer('d'),
                    '*': () => tracer('e'),
                },
            }),
        },
    });

    const store = d.createStore();

    t.same(store.getState(),{
        tracer: 'b',
        bar: { tracer: 'e' },
    });

    store.dispatch( (store.actions as any).foo() );

    t.same(store.getState(),{
        tracer: 'ba',
        bar: { tracer: 'ed' },
    });

    store.dispatch({ type: 'bar' });

    t.same(store.getState(),{
        tracer: 'ede',
        bar: { tracer: 'ede' },
    });

    t.end();
});

tap.test( 'splat and state', async t => {

    const inner = dux({ initial: 3 });
    inner.initial;

    const arrayDux = dux({
        initial: [],
        subduxes: {
            '*': inner
        }
    });

    expectType<number[]>(arrayDux.initial)
    t.same(arrayDux.initial,[]);

    const objDux = dux({
        initial: {},
        subduxes: {
            '*': dux({initial: 3})
        }
    });

    expectType<{
        [key: string]: number
    }>(objDux.initial);

    t.same(objDux.initial,{});

});

tap.test( 'multi-splat', async t => {

    dux({
        subduxes: {
            foo: dux({ mutations: { '*': () => s => s }}),
            bar: dux({ mutations: { '*': () => s => s }}),
        }
    });

    t.pass();

});
