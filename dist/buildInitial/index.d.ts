import { Dictionary } from '../types';
declare function buildInitial<S extends number | string | boolean>(initial: S, subduxes?: Dictionary<undefined>): S;
declare function buildInitial<S extends object>(initial?: Partial<S>, subduxes?: Partial<S>): S extends object ? S : never;
export default buildInitial;
//# sourceMappingURL=index.d.ts.map