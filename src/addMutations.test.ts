import { action } from 'ts-action';

import Updux from "./updux";

type MyState = {
  sum: number;
};

test("added mutation is present", () => {
  const updux = new Updux<MyState>({
    initial: { sum: 0 }
  });

  const add = action("add", (n: number) => ({ payload: {  n } }));

  updux.addMutation(add, ({ n }, action) => ({ sum }) => ({ sum: sum + n }));

  const store = updux.createStore();
  store.dispatch.add(3);

  expect(store.getState()).toEqual({ sum: 3 });
});
