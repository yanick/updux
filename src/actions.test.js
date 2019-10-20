import updux from '.';
import u from 'updeep';

test( 'actions defined in effects and mutations, multi-level', () => {

    const { actions } = updux({
        effects: {
            foo: api => next => action => { },
        },
        mutations: { bar: () => () => null },
        subduxes: {
            mysub: updux({
                effects: { baz: api => next => action => { }, },
                mutations: { quux: () => () => null },
            })
        },
    });

    const types = Object.keys(actions);
    types.sort();

    expect( types).toEqual([ 'bar', 'baz', 'foo', 'quux', ]);

});
