import Updux from '.';
import { action } from 'ts-action';
import { Effect } from './buildMiddleware';
import tap from 'tap';
import sinon from 'sinon';

const myEffect: Effect = [
    '*',
    () => next => action => next({ ...action, hello: true }),
];

const codux = new Updux({
    actions: {
        foo: action('foo'),
    },
    effects: [myEffect],
});

const dux = new Updux({
    coduxes: [codux],
});

tap.test('actions', t => {
    t.ok(dux.actions.foo);
    t.end();
});

tap.test('effects', t => {
    const next = sinon.fake();

    dux.middleware({} as any)(next)({ type: 'foo' });

    t.same(next.lastCall.lastArg, { type: 'foo', hello: true });

    t.end();
});
