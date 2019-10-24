import { expectType, expectError } from 'tsd';

import buildInitial from './src/buildInitial';

expectType<{}>(buildInitial());

type MyState = {
    foo: {
        bar: number
    },
    baz: string,
}

expectType<MyState>(buildInitial<MyState>());

expectError( buildInitial<MyState>({ foo: { bar: "potato" } }) );

