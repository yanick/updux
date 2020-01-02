import Updux, { actionCreator } from "./updux";

describe("as array of arrays", () => {
  const doIt = actionCreator("doIt");

  const updux = new Updux({
    initial: "",
    mutations: [
      [doIt, () => () => "bingo"],
      ["thisToo", () => () => "straight type"]
    ]
  });

  const store = updux.createStore();

  test("doIt", () => {
    store.dispatch.doIt();
    expect(store.getState()).toEqual("bingo");
  });

  test("straight type", () => {
    store.dispatch.thisToo();
    expect(store.getState()).toEqual("straight type");
  });
});
