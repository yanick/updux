import { action } from 'ts-action';
import tap from 'tap';

import Updux from "./updux";

type MyState = {
  sum: number;
};

tap.test("added mutation is present", t => {
  const updux = new Updux<MyState>({
    initial: { sum: 0 }
  });

  const add = action("add", (n: number) => ({ payload: {  n } }));

  updux.addMutation(add, ({ n }) => ({ sum }) => ({ sum: sum + n }));

  const store = updux.createStore();
  store.dispatch(add(3));

  t.same(store.getState(), {sum: 3});

  t.end();
});
