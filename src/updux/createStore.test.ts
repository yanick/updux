import tap from 'tap';
import { expectType } from 'tsd';

import { dux } from '..';

import { action } from 'ts-action';

const d = dux({
    initial: 123,
    actions: {
        foo: action('foo'),
    },
});

expectType<number>( d.createStore().getState() );

tap.equal(d.createStore().getState(), 123, 'default initial state');

tap.equal(d.createStore(456).getState(), 456, 'given initial state');

expectType<{ foo: Function }>( d.createStore().actions );
tap.pass('we have actions');
