import fp from 'lodash/fp';
import u from 'updeep';

function buildInitial(initial: any, coduxes: any = [], subduxes: any = {}) {
    if (!fp.isPlainObject(initial)) return initial;

    return fp.flow(
        [
            u(fp.omit(['*'], subduxes)),
            coduxes.map(i => u(i)),
            u(initial),
        ].flat()
    )({});
}

export default buildInitial;
