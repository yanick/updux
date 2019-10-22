import fp from 'lodash/fp';

export default function buildInitial(
  initial= {},
  subduxes = {},
) {
  return fp.isPlainObject(initial) ? fp.mergeAll([subduxes, initial]) : initial;
}
