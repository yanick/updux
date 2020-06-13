import { test } from 'tap';
import Updux, { dux, coduxes, DuxState } from '.';
import { expectType } from 'tsd';

test('basic selectors', async t => {
    const updux = dux({
        subduxes: {
            bogeys: dux({
                selectors: {
                    bogey: (bogeys: any) => (id: string) => bogeys[id],
                },
            }),
        },
        selectors: {
            bogeys: ({ bogeys }) => bogeys,
        },
    });

    const state = {
        bogeys: {
            foo: 1,
            bar: 2,
        },
    };

    t.same(updux.selectors.bogeys(state), { foo: 1, bar: 2 });
    t.equal(updux.selectors.bogey(state)('foo'), 1);
});

test('available in the middleware', async t => {
    const updux = dux<any, any>({
        subduxes: {
            bogeys: dux({
                initial: { enkidu: 'foo' },
                selectors: {
                    bogey: (bogeys: any) => (id: string) => bogeys[id],
                },
            }),
        },
        effects: {
            doIt: ({ selectors: { bogey }, getState }) => next => action => {
                next({
                    ...action,
                    payload: bogey(getState())('enkidu'),
                });
            },
        },
        mutations: {
            doIt: payload => state => ({ ...state, payload }),
        },
    });

    const store = updux.createStore();
    store.dispatch(updux.actions.doIt());

    t.match(store.getState(), { payload: 'foo' });
});

test('selector typescript', async t => {
    const bar = dux({
        initial: { baz: 1 } as { baz: number },
        selectors: {
            getBaz: (state: { baz: number }) => state.baz,
            getStringBaz: state => `${state.baz}`,
            getMultBaz: state => (mult: number) => state.baz * mult,
        },
    });

    expectType<{
        getBaz: Function;
        getStringBaz: Function;
    }>(bar.selectors);

    t.same(bar.selectors.getBaz(bar.initial), 1);
    t.same(bar.selectors.getMultBaz({ baz: 3 })(2), 6);

    test('subduxes', async t => {
        const foo = dux({
            subduxes: { bar },
            ...coduxes( dux({}) ),
            selectors: {
                getRoot: () => 'root'
            }
        });

        expectType<{
            ({ bar: { baz: number } }): number;
        }>(foo.selectors.getBaz);

        t.same(foo.selectors.getBaz(foo.initial), 1);
        t.same(foo.selectors.getMultBaz({ bar: { baz: 3 } })(2), 6);

        t.ok( foo.selectors.getRoot );
    });

    test('no root selector', async t => {
        const foo = dux({
            subduxes: {
                quux: dux({}),
                bar: dux({
                    selectors: {
                        getBaz: () => 'baz'
                    }
                })
            }
        });

        t.ok(foo.selectors.getBaz);
    });
});

test('selector in mw', async () => {
    const myDux = new Updux(
        {
            initial: { stuff: 12 },
            subduxes: {
                bar: dux({
                    initial: 'potato',
                    selectors: { getBar: () => 'meh' }
                })
            },
            selectors: {
                // TODO here we should auto-populate the state
                getStuff: (state: {stuff: number}) => state.stuff
            }
        }
    );

    myDux.addEffect( '*', ({
        selectors, getState
    }) => () => () => {
        expectType<DuxState<typeof myDux>>( getState() );
        expectType<(...args:any[]) => number>(selectors.getStuff);
    });
});
