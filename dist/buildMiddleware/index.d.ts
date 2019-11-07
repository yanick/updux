import { Dictionary, ActionCreator, UpduxMiddleware } from '../types';
declare function buildMiddleware<S = any>(effects?: Dictionary<UpduxMiddleware<S>>, actions?: Dictionary<ActionCreator>, subduxes?: any): UpduxMiddleware<S>;
export default buildMiddleware;
//# sourceMappingURL=index.d.ts.map