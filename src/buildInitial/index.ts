import fp from 'lodash/fp';

export default function buildInitial(initial : any = {}, subduxes = {}) {
  let state = initial;

  if (fp.isPlainObject(initial)) {
    initial = fp.mergeAll([ subduxes, initial, ]);
  }

  return initial;
}
