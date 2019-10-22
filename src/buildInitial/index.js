import fp from 'lodash/fp';

export default function buildInitial<S = any>(
  initial: any = {},
  subduxes = {},
): S {
  return fp.isPlainObject(initial) ? fp.mergeAll([subduxes, initial]) : initial;
}
