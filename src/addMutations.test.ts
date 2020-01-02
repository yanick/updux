import Updux, { actionCreator } from "./updux";

type MyState = {
  sum: number;
};

test("added mutation is present", () => {
  const updux = new Updux<MyState>({
    initial: { sum: 0 }
  });

  const add = actionCreator("add", (n: number) => ({ n }));

  updux.addMutation(add, ({ n }, action) => ({ sum }) => ({ sum: sum + n }));

  const store = updux.createStore();
  store.dispatch.add(3);

  expect(store.getState()).toEqual({ sum: 3 });
});
