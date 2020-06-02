import { buildMiddleware, subMiddleware } from '.';
import tap from 'tap';
import sinon from 'sinon';

const myMiddleware = (tag: string) => api => next => action => {
    next({
        ...action,
        payload: [...action.payload, tag],
    });
};

const local1 = myMiddleware('local1');
const local2 = myMiddleware('local2');
const co = myMiddleware('co');
const sub = myMiddleware('sub');

tap.test('basic', t => {
    const next = sinon.fake();

    const mw = buildMiddleware([local1, local2], [co], { sub });

    mw({} as any)(next)({ type: 'foo', payload: [] });

    t.match(next.firstCall.args, [
        {
            type: 'foo',
            payload: ['local1', 'local2', 'co', 'sub'],
        },
    ]);

    t.end();
});

tap.test('inner in the middle', t => {
    const next = sinon.fake();

    const mw = buildMiddleware([local1, subMiddleware, local2], [co], {
        sub,
    });

    mw({} as any)(next)({ type: 'foo', payload: [] });

    t.match(next.firstCall.lastArg, {
        type: 'foo',
        payload: ['local1', 'co', 'sub', 'local2'],
    });

    t.end();
});

tap.test('sub-mw get their store sliced', t => {
    const next = sinon.fake();

    const sub = ({ getState }) => next => action => next(getState());

    const mw = buildMiddleware([], [], { sub });

    mw({
        getState() {
            return { foo: 1, sub: 2 };
        },
    } as any)(next)({ type: 'noop' });

    t.same( next.firstCall.lastArg, 2 );

    t.end();
});
