"use strict";

var _ = _interopRequireDefault(require("."));

var _updeep = _interopRequireDefault(require("updeep"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

test('actions defined in effects and mutations, multi-level', () => {
  const {
    actions
  } = (0, _.default)({
    effects: {
      foo: api => next => action => {}
    },
    mutations: {
      bar: () => () => null
    },
    subduxes: {
      mysub: {
        effects: {
          baz: api => next => action => {}
        },
        mutations: {
          quux: () => () => null
        },
        actions: {
          foo: limit => ({
            limit
          })
        }
      },
      myothersub: {
        effects: {
          foo: () => () => () => {}
        }
      }
    }
  });
  const types = Object.keys(actions);
  types.sort();
  expect(types).toEqual(['bar', 'baz', 'foo', 'quux']);
  expect(actions.bar()).toEqual({
    type: 'bar'
  });
  expect(actions.bar('xxx')).toEqual({
    type: 'bar',
    payload: 'xxx'
  });
  expect(actions.bar(undefined, 'yyy')).toEqual({
    type: 'bar',
    meta: 'yyy'
  });
  expect(actions.foo(12)).toEqual({
    type: 'foo',
    payload: {
      limit: 12
    }
  });
});