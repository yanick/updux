import Updux, { actionCreator } from ".";
import u from "updeep";

test("simple effect", () => {
  const tracer = jest.fn();

  const store = new Updux({
    effects: {
      foo: (api: any) => (next: any) => (action: any) => {
        tracer();
        next(action);
      }
    }
  }).createStore();

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch({ type: "bar" });

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch.foo();

  expect(tracer).toHaveBeenCalled();
});

test("effect and sub-effect", () => {
  const tracer = jest.fn();

  const tracerEffect = (signature: string) => (api: any) => (next: any) => (
    action: any
  ) => {
    tracer(signature);
    next(action);
  };

  const store = new Updux({
    effects: {
      foo: tracerEffect("root")
    },
    subduxes: {
      zzz: {
        effects: {
          foo: tracerEffect("child")
        }
      }
    }
  }).createStore();

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch({ type: "bar" });

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch.foo();

  expect(tracer).toHaveBeenNthCalledWith(1, "root");
  expect(tracer).toHaveBeenNthCalledWith(2, "child");
});

test('"*" effect', () => {
  const tracer = jest.fn();

  const store = new Updux({
    effects: {
      "*": api => next => action => {
        tracer();
        next(action);
      }
    }
  }).createStore();

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch({ type: "bar" });

  expect(tracer).toHaveBeenCalled();
});

test("async effect", async () => {
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
      }
    }
  }).createStore();

  expect(tracer).not.toHaveBeenCalled();

  store.dispatch.foo();

  expect(tracer).not.toHaveBeenCalled();

  await timeout(1000);

  expect(tracer).toHaveBeenCalled();
});

test("getState is local", () => {
  let childState;
  let rootState;
  let rootFromChild;

  const child = new Updux({
    initial: { alpha: 12 },
    effects: {
      doIt: ({ getState, getRootState }) => next => action => {
        childState = getState();
        rootFromChild = getRootState();
        next(action);
      }
    }
  });

  const root = new Updux({
    initial: { beta: 24 },
    subduxes: { child },
    effects: {
      doIt: ({ getState }) => next => action => {
        rootState = getState();
        next(action);
      }
    }
  });

  const store = root.createStore();
  store.dispatch.doIt();

  expect(rootState).toEqual({ beta: 24, child: { alpha: 12 } });
  expect(rootFromChild).toEqual({ beta: 24, child: { alpha: 12 } });
  expect(childState).toEqual({ alpha: 12 });
});

test("middleware as map", () => {
  let childState;
  let rootState;
  let rootFromChild;

  const doIt = actionCreator("doIt");

  const child = new Updux({
    initial: "",
    effects: [
      [
        doIt,
        () => next => action => {
          next(u({ payload: (p: string) => p + "Child" }, action) as any);
        }
      ]
    ]
  });

  const root = new Updux({
    initial: { message: "" },
    subduxes: { child },
    effects: [
      [
        "^",
        () => next => action => {
          next(u({ payload: (p: string) => p + "Pre" }, action) as any);
        }
      ],
      [
        doIt,
        () => next => action => {
          next(u({ payload: (p: string) => p + "Root" }, action) as any);
        }
      ],
      [
        "*",
        () => next => action => {
          next(u({ payload: (p: string) => p + "After" }, action) as any);
        }
      ],
      [
        "$",
        () => next => action => {
          next(u({ payload: (p: string) => p + "End" }, action) as any);
        }
      ]
    ],
    mutations: [[doIt, (message: any) => () => ({ message })]]
  });

  const store = root.createStore();
  store.dispatch.doIt("");

  expect(store.getState()).toEqual({ message: "PreRootAfterChildEnd" });
});

test("generator", () => {
  const updux = new Updux({
    initial: 0,
    mutations: [["doIt", payload => () => payload]],
    effects: [
      [
        "doIt",
        () => {
          let i = 0;
          return () => (next: any) => (action: any) =>
            next({ ...action, payload: ++i });
        },
        true
      ]
    ]
  });

  const store1 = updux.createStore();
  store1.dispatch.doIt();
  expect(store1.getState()).toEqual(1);
  store1.dispatch.doIt();
  expect(store1.getState()).toEqual(2);
  updux.actions;

  const store2 = updux.createStore();
  store2.dispatch.doIt();
  expect(store2.getState()).toEqual(1);
});
