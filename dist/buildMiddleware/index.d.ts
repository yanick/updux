import { Middleware } from 'redux';
import { Dictionary, ActionCreator, UpduxDispatch } from '../types';
declare function buildMiddleware<S = any>(effects?: Dictionary<Middleware<{}, S, UpduxDispatch>>, actions?: Dictionary<ActionCreator>, subMiddlewares?: Middleware<{}, S, UpduxDispatch>[]): Middleware<{}, S, UpduxDispatch>;
export default buildMiddleware;
//# sourceMappingURL=index.d.ts.map