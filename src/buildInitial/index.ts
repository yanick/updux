import fp from 'lodash/fp';

function buildInitial<S extends object>( initial?: Partial<S>, subduxes?: Partial<S> ): S;
function buildInitial(
  initial = {},
  subduxes = {} ,
) {
  return fp.isPlainObject(initial) ? fp.mergeAll([subduxes, initial]) : initial;
}

export default buildInitial;
