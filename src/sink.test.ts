import Updux from './updux';

const foo = new Updux<number>({
  initial: 0,
  mutations: {
    doIt: () => (state: number) => {
      console.log(state);
      return state + 1;
    },
  },
});

const bar = new Updux<{foo: number}>({
  subduxes: {foo},
  mutations: {
    doIt: () => (state: any) => state,
  },
});

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
