import Updux from '.';

test('basic selectors', () => {
    const updux = new Updux({
        subduxes: {
            bogeys: {
                selectors: {
                    bogey: (bogeys: any) => (id: string) => bogeys[id],
                },
            },
        },
        selectors: {
            bogeys: ({ bogeys }: any) => bogeys,
        },
    });

    const state = {
        bogeys: {
            foo: 1,
            bar: 2,
        },
    };

    expect(updux.selectors.bogeys(state)).toEqual({ foo: 1, bar: 2 });
    expect((updux.selectors.bogey(state) as any)('foo')).toEqual(1);
});

test('available in the middleware', () => {
    const updux = new Updux({
        subduxes: {
            bogeys: {
                initial: { enkidu: 'foo' },
                selectors: {
                    bogey: (bogeys: any) => (id: string) => bogeys[id],
                },
            },
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
    store.dispatch.doIt();

    expect(store.getState()).toMatchObject({ payload: 'foo' });
});
