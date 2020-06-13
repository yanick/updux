import { dux } from '.';
import tap from 'tap';

const foo = dux({
    initial: { root: 'abc' },
    coduxes: [
        dux({ initial: { co: 'works' } }),
        dux({ initial: { co2: 'works' } }),
    ],
    subduxes: {
        bar: dux({ initial: 123 }),
    },
});

tap.same(foo.initial, { root: 'abc', co: 'works', co2: 'works', bar: 123 });
