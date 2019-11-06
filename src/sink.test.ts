import Updux from './updux';

const foo = new Updux<number>({
  initial: 0,
  mutations: {
    doIt: () => (state: number) => {
      return state + 1;
    },
    doTheThing: () => (state: number) => {
      return state + 3;
    },
  },
});

const bar = new Updux<{foo: number}>({
  subduxes: {foo},
});

bar.addMutation(
  foo.actions.doTheThing,
  (_, action) => state => {
    return {
      ...state,
      baz: bar.subduxUpreducer(action)(state),
    };
  },
  true,
);

bar.addMutation(
  foo.actions.doIt,
  () => (state: any) => ({...state, bar: 'yay'}),
  true,
);

test('initial', () => {
  expect(bar.initial).toEqual({foo: 0});
});

test('foo alone', () => {
  expect(foo.reducer(undefined, foo.actions.doIt())).toEqual(1);
});

test('sink mutations', () => {
  expect(bar.reducer(undefined, bar.actions.doIt())).toEqual({
    foo: 0,
    bar: 'yay',
  });
});

test('sink mutation and subduxUpreducer', () => {
  expect(bar.reducer(undefined, bar.actions.doTheThing())).toEqual({
    foo: 0,
    baz: {foo: 3},
  });
});
