import updux from '.';
import u from 'updeep';

const noopEffect = () => () => () => {};

test('actions defined in effects and mutations, multi-level', () => {
  const {actions} = updux({
    effects: {
      foo: noopEffect,
    },
    mutations: {bar: () => () => null},
    subduxes: {
      mysub: {
        effects: {baz: noopEffect },
        mutations: {quux: () => () => null},
        actions: {
          foo: (limit:number) => ({limit}),
        },
      },
      myothersub: {
        effects: {
          foo: noopEffect,
        },
      },
    },
  });

  const types = Object.keys(actions);
  types.sort();

  expect(types).toEqual(['bar', 'baz', 'foo', 'quux']);

  expect(actions.bar()).toEqual({type: 'bar'});
  expect(actions.bar('xxx')).toEqual({type: 'bar', payload: 'xxx'});
  expect(actions.bar(undefined, 'yyy')).toEqual({type: 'bar', meta: 'yyy'});

  expect(actions.foo(12)).toEqual({type: 'foo', payload: {limit: 12}});
});
