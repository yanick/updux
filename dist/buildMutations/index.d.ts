/// <reference types="lodash" />
import { Mutation, Action, Dictionary } from '../types';
declare function buildMutations(mutations?: Dictionary<Mutation | ([Mutation, boolean | undefined])>, subduxes?: {}): import("lodash").Dictionary<Mutation<any, Action<string, any>>>;
export default buildMutations;
//# sourceMappingURL=index.d.ts.map