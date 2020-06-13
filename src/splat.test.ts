import Updux from '.';
import u from 'updeep';

const tracer = (chr:string) => u({ tracer: (s='') => s + chr });

test( 'mutations, simple', () => {
    const dux = new Updux({
        mutations: {
            foo: () => tracer('a'),
            '*': () => tracer('b'),
        },
    });

   const store = dux.createStore();

    expect(store.getState()).toEqual({ tracer: 'b'});

    store.dispatch.foo();

    expect(store.getState()).toEqual({ tracer: 'ba', });

    store.dispatch({ type: 'bar' });

    expect(store.getState()).toEqual({ tracer: 'bab', });
});

test( 'with subduxes', () => {
    const dux = new Updux({
        mutations: {
            foo: () => tracer('a'),
            '*': () => tracer('b'),
            bar: () => ({bar}:any) => ({ bar, tracer: bar.tracer })
        },
        subduxes: {
            bar: {
                mutations: {
                    foo: () => tracer('d'),
                        '*': () => tracer('e'),
                },
            },
        },
    });

   const store = dux.createStore();

    expect(store.getState()).toEqual({
        tracer: 'b',
        bar: { tracer: 'e' } });

    store.dispatch.foo();

    expect(store.getState()).toEqual({
        tracer: 'ba',
        bar: { tracer: 'ed' } });

    store.dispatch({type: 'bar'});

    expect(store.getState()).toEqual({
        tracer: 'ede',
        bar: { tracer: 'ede' } });


});
