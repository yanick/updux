import { action, payload } from 'ts-action';
import u from 'updeep';

import Updux from '.';

const noopEffect = () => () => () => {};

test('actions defined in effects and mutations, multi-level', () => {
  const bar = action('bar',(payload,meta) => ({payload,meta}) );
  const foo = action('foo',(limit:number) => ({payload:{ limit} }) );

  const {actions} = new Updux({
      effects: [ [ foo, noopEffect ] ],
    mutations: [ [ bar, () => () => null ] ],
    subduxes: {
      mysub: {
        effects: {baz: noopEffect},
        mutations: {quux: () => () => null},
        actions: {
          foo
        },
      },
      myothersub: {
          effects: [ [foo, noopEffect] ],
      },
    },
  });

  const types = Object.keys(actions);
  types.sort();

  expect(types).toEqual(['bar', 'baz', 'foo', 'quux']);

  expect(actions.bar()).toEqual({type: 'bar'});
  expect(actions.bar('xxx')).toEqual({type: 'bar', payload: 'xxx'});
  expect(actions.bar(undefined, 'yyy')).toEqual({type: 'bar', payload: undefined, meta: 'yyy'});

  expect(actions.foo(12)).toEqual({type: 'foo', payload: {limit: 12}});
});

describe('different calls to addAction', () => {
  const updux = new Updux();

  test('string', () => {
    updux.addAction( action('foo', payload() ));
    expect(updux.actions.foo('yo')).toMatchObject({
      type: 'foo',
      payload: 'yo',
    });
  });

  test('actionCreator inlined', () => {
    updux.addAction( 'baz', (x) => ({payload: {x}}));
    expect(updux.actions.baz(3)).toMatchObject({
      type: 'baz', payload: { x: 3 }
    });
  });
});
