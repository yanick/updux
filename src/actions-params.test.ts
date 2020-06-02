import Updux, { dux, coduxes } from '.';
import { action, payload } from 'ts-action';
import { test } from 'tap';
import { expectAssignable } from 'tsd';
import { DuxActionsCoduxes } from './types';

const foo_actions = {
    aaa: action('aaa', payload<number>()),
};

const fooDux = dux({
    actions: foo_actions,
});

const bar_actions = {
    bbb: action('bbb', (x: string) => ({ payload: '1' + x })),
};

test('actions are present', t => {
    const barDux = dux({
        subduxes: { foo: fooDux },
        actions: bar_actions,
    });

    const result = Object.keys(barDux.actions);
    result.sort();
    t.same(result, ['aaa', 'bbb']);
    t.end();
});

const a = action('a');
const b = action('b');

test('typing', t => {
    t.test('nothing at all', t => {
        const foo = new Updux();
        t.same(foo.actions, {});
        t.end();
    });

    t.test('with two coduxes', t => {
        const myDux = new Updux({
            ...coduxes(dux({ actions: { a } }), dux({ actions: { b } })),
        });

        t.ok(myDux.actions.a);
        t.end();
    });

    t.test('empty dux', t => {
        const empty = dux({});

        expectAssignable<object>(empty.actions);

        t.same(empty.actions, {}, 'no actions there');

        t.end();
    });

    t.test('coduxes actions', t => {
        const typeOf = <C>(x: C) => (x as any) as DuxActionsCoduxes<C>;

        expectAssignable<{ a: any }>(typeOf([dux({ actions: { a } })]));
        expectAssignable<{}>(typeOf([dux({})]));

        expectAssignable<{ a: any; b: any }>(
            typeOf([dux({ actions: { a } }), dux({ actions: { b } })])
        );

        const co = coduxes(dux({ actions: { a } }), dux({})).coduxes;

        expectAssignable<{ a: any }>(typeOf(co));

        t.end();
    });

    t.test('with empty coduxes', t => {
        const emptyDux = dux({});

        const myDux = dux({
            ...coduxes(dux({ actions: { a } }), emptyDux),
        });

        t.ok(myDux.actions.a);
        t.end();
    });

    t.test('with three coduxes', t => {
        const emptyDux = new Updux();
        emptyDux.actions;

        const dux = new Updux({
            coduxes: [
                emptyDux,
                new Updux({ actions: { a } }),
                new Updux({ actions: { b } }),
            ],
        });

        t.ok(dux.actions.b);
        t.end();
    });

    t.test('with grandchild', t => {
        const dux = new Updux({
            subduxes: {
                bar: new Updux({
                    subduxes: {
                        baz: new Updux({
                            actions: { a },
                        }),
                    },
                }),
            },
        });

        t.ok(dux.actions.a);
        t.end();
    });
    t.end();
});
