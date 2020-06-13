import tap from 'tap';
import { expectType } from 'tsd';

import { dux, DuxState } from '.';

const myDux = dux({
    initial: { a: 1, b: "potato" }
});

type State = DuxState<typeof myDux>;

expectType<State>({ a: 12, b: "something" });

tap.pass();
