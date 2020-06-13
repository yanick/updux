import { action, payload } from 'ts-action';

import Updux, { dux } from '.';
import { test } from 'tap';
import { expectAssignable } from 'tsd';

const noopEffect = () => () => () => null;

test(
    'actions defined in effects and mutations, multi-level',
    { autoend: true },
    t => {
        const bar = action('bar', (payload, meta) => ({ payload, meta }));
        const foo = action('foo', (limit: number) => ({
            payload: { limit },
        }));

        const { actions }: any = dux({
            effects: [[foo, noopEffect] as any],
            mutations: [[bar, () => () => null]],
            subduxes: {
                mysub: dux({
                    effects: { baz: noopEffect },
                    mutations: { quux: () => () => null },
                    actions: {
                        foo,
                    },
                }),
                myothersub: dux({
                    effects: [[foo, noopEffect]],
                }),
            },
        });

        const types = Object.keys(actions);
        types.sort();

        t.match(types, ['bar', 'baz', 'foo', 'quux']);

        t.match(actions.bar(), { type: 'bar' });
        t.match(actions.bar('xxx'), { type: 'bar', payload: 'xxx' });
        t.match(actions.bar(undefined, 'yyy'), {
            type: 'bar',
            payload: undefined,
            meta: 'yyy',
        });

        t.same(actions.foo(12), { type: 'foo', payload: { limit: 12 } });
    }
);

test('different calls to addAction', t => {
    const updux = new Updux<any,any>();

    updux.addAction(action('foo', payload()));
    t.match(updux.actions.foo('yo'), {
        type: 'foo',
        payload: 'yo',
    });

    updux.addAction('baz', x => ({ x }));
    t.match(updux.actions.baz(3), {
        type: 'baz',
        payload: { x: 3 },
    });

    t.end();
});

test('types', t => {
    const {actions} = dux({ actions: {
        foo: action('foo')
    }});

    expectAssignable<object>( actions );

    t.end();
});
