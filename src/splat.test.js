import updux from '.';
import u from 'updeep';

const tracer = chr => u({ tracer: s => (s||'') + chr });

test( 'mutations, simple', () => {
    const dux = updux({
        mutations: {
            foo: () => tracer('a'),
            '*': (p,a) => tracer('b'),
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
    const dux = updux({
        mutations: {
            foo: () => tracer('a'),
            '*': (dummy,a) => tracer('b'),
            bar: () => ({bar}) => ({ bar, tracer: bar.tracer })
        },
        subduxes: {
            bar: updux({
                mutations: {
                    foo: () => tracer('d'),
                    '*': (dummy,a) => { console.log( "got a ", dummy, a ); return tracer('e') },
                },
            }),
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
