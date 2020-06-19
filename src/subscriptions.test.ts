import tap from 'tap';
import Updux from '.';
import { action, payload } from 'ts-action';
import u from 'updeep';

const inc = action('inc');
const set_double = action('set_double', payload<number>());

const dux = new Updux({
    initial: {
        x: 0,
        double: 0,
    },
    actions: {
        inc,
    },
    mutations: [
        [inc, payload => u({ x: x => x + 1 })],
        [set_double, double => u({ double })],
    ],
});

dux.addSubscription(store => (state, unsubscribe) => {
    if (state.x > 2) return unsubscribe();

    store.dispatch(set_double(state.x * 2));
});

const store = dux.createStore();

store.dispatch(inc());

tap.same(store.getState(), { x: 1, double: 2 });

store.dispatch(inc());
store.dispatch(inc());

tap.same(store.getState(), { x: 3, double: 4 }, 'we unsubscribed');

tap.test('subduxes subscriptions', async t => {
    const inc_top = action('inc_top');
    const inc_bar = action('inc_bar');
    const transform_bar = action('transform_bar', payload());

    const bar = new Updux({
        initial: 'a',
        mutations: [
            [inc_bar, () => state => state + 'a'],
            [transform_bar, outcome => () => outcome],
        ],
        subscriptions: [
            store => (state, unsubscribe) => {
                console.log({ state });

                if (state.length <= 2) return;
                unsubscribe();
                store.dispatch(transform_bar('look at ' + state));
            },
        ],
    });

    const dux = new Updux({
        initial: {
            count: 0,
        },
        subduxes: {
            bar: bar.asDux,
        },
        mutations: [[inc_top, () => u({ count: count => count + 1 })]],
        effects: [
            [
                '*',
                () => next => action => {
                    console.log('before ', action.type);
                    next(action);
                    console.log({ action });
                },
            ],
        ],
        subscriptions: [
            store => {
                let previous: any;
                return ({ count }) => {
                    if (count !== previous) {
                        previous = count;
                        store.dispatch(inc_bar());
                    }
                };
            },
        ],
    });

    const store = dux.createStore();

    store.dispatch(inc_top());
    store.dispatch(inc_top());

    t.same(store.getState(), {
        count: 2,
        bar: 'look at look at aaa',
    });
    store.dispatch(inc_top());
    t.same(store.getState(), {
        count: 3,
        bar: 'look at look at aaaa',
    });
});
