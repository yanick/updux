"use strict";

var _ = _interopRequireDefault(require("."));

var _updeep = _interopRequireDefault(require("updeep"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tracer = chr => (0, _updeep.default)({
  tracer: s => (s || '') + chr
});

test('mutations, simple', () => {
  const dux = (0, _.default)({
    mutations: {
      foo: () => tracer('a'),
      '*': (p, a) => tracer('b')
    }
  });
  const store = dux.createStore();
  expect(store.getState()).toEqual({
    tracer: 'b'
  });
  store.dispatch.foo();
  expect(store.getState()).toEqual({
    tracer: 'ba'
  });
  store.dispatch({
    type: 'bar'
  });
  expect(store.getState()).toEqual({
    tracer: 'bab'
  });
});
test('with subduxes', () => {
  const dux = (0, _.default)({
    mutations: {
      foo: () => tracer('a'),
      '*': (dummy, a) => tracer('b'),
      bar: () => ({
        bar
      }) => ({
        bar,
        tracer: bar.tracer
      })
    },
    subduxes: {
      bar: (0, _.default)({
        mutations: {
          foo: () => tracer('d'),
          '*': (dummy, a) => tracer('e')
        }
      })
    }
  });
  const store = dux.createStore();
  expect(store.getState()).toEqual({
    tracer: 'b',
    bar: {
      tracer: 'e'
    }
  });
  store.dispatch.foo();
  expect(store.getState()).toEqual({
    tracer: 'ba',
    bar: {
      tracer: 'ed'
    }
  });
  store.dispatch({
    type: 'bar'
  });
  expect(store.getState()).toEqual({
    tracer: 'ede',
    bar: {
      tracer: 'ede'
    }
  });
});