import buildInitial from '.';
import {expectType} from 'tsd';

type MyState = {
    foo: number,
    bar: string,
};

const x = buildInitial<MyState>({
    initial: {
        glug: 3,
    }
});
expectType<MyState>(x);
