import fp from 'lodash/fp';
import { Dictionary } from '../types';

function buildInitial<S extends number|string|boolean>( initial: S, subduxes?: Dictionary<undefined> ): S;
function buildInitial<S extends object>( initial?: Partial<S>, subduxes?: Partial<S> ): S extends object ? S : never;
function buildInitial(
  initial : any = {},
  subduxes : any = {} ,
) {
  return fp.isPlainObject(initial) ? fp.mergeAll([subduxes, initial]) : initial;
}

export default buildInitial;
