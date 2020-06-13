import Updux from '.';
import u from 'updeep';

test('simple effect', () => {
  const tracer = jest.fn();

  const store = new Updux({
    effects: {
      foo: (api: any) => (next: any) => (action: any) => {
        tracer();
        next(action);
      },
    },
  }).createStore();

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch({type: 'bar'});

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch.foo();

  expect(tracer).toHaveBeenCalled();
});

test('effect and sub-effect', () => {
  const tracer = jest.fn();

  const tracerEffect = (signature: string) => (api: any) => (next: any) => (
    action: any,
  ) => {
    tracer(signature);
    next(action);
  };

  const store = new Updux({
    effects: {
      foo: tracerEffect('root'),
    },
    subduxes: {
      zzz: {
        effects: {
          foo: tracerEffect('child'),
        },
      },
    },
  }).createStore();

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch({type: 'bar'});

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch.foo();

  expect(tracer).toHaveBeenNthCalledWith(1, 'root');
  expect(tracer).toHaveBeenNthCalledWith(2, 'child');
});

test('"*" effect', () => {
  const tracer = jest.fn();

  const store = new Updux({
    effects: {
      '*': api => next => action => {
        tracer();
        next(action);
      },
    },
  }).createStore();

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch({type: 'bar'});

  expect(tracer).toHaveBeenCalled();
});

test('async effect', async () => {
  function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const tracer = jest.fn();

  const store = new Updux({
    effects: {
      foo: api => next => async action => {
        next(action);
        await timeout(1000);
        tracer();
      },
    },
  }).createStore();

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch.foo();

  expect(tracer).not.toHaveBeenCalled();

  await timeout(1000);

  expect(tracer).toHaveBeenCalled();
});

test('getState is local', () => {
  let childState;
  let rootState;
  let rootFromChild;

  const child = new Updux({
    initial: {alpha: 12},
    effects: {
      doIt: ({getState,getRootState}) => next => action => {
        childState = getState();
        rootFromChild = getRootState();
        next(action);
      },
    },
  });

  const root = new Updux({
    initial: {beta: 24},
    subduxes: {child},
    effects: {
      doIt: ({getState}) => next => action => {
        rootState = getState();
        next(action);
      },
    },
  });

  const store = root.createStore();
  store.dispatch.doIt();

  expect(rootState).toEqual({beta: 24, child: {alpha: 12}});
  expect(rootFromChild).toEqual({beta: 24, child: {alpha: 12}});
  expect(childState).toEqual({alpha: 12});
});
