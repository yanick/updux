import Updux, { dux } from '.';
import tap from 'tap';
import { action } from 'ts-action';

const foo = dux({
    initial: 0,
    actions: {
       doIt: action('doIt'),
       doTheThing: action('doTheThing'),
    },
    mutations: {
        doIt: () => (state: number) => {
            return state + 1;
        },
        doTheThing: () => (state: number) => {
            return state + 3;
        },
    },
});

const bar: any = new Updux<{ foo: number }>({
    subduxes: { foo },
});

bar.addMutation(
    foo.actions.doTheThing,
    (_, action) => state => {
        return {
            ...state,
            baz: foo.upreducer(action)(state.foo),
        };
    },
    true
);

bar.addMutation(
    foo.actions.doIt,
    () => (state: any) => ({ ...state, bar: 'yay' }),
    true
);

tap.same(bar.initial, { foo: 0 });

tap.test('foo alone', t => {
    t.is(foo.reducer(undefined, foo.actions.doIt()), 1);
    t.end();
});

tap.test('sink mutations', t => {
    t.same(
        bar.reducer(undefined, bar.actions.doIt()), {
            foo: 0,
            bar: 'yay',
        });

    t.end();
});
