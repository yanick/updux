import { Middleware, Reducer } from 'redux';
import { ActionCreator, Dictionary } from '../types';
declare function buildCreateStore<S>(reducer: Reducer<S>, initial: S, middleware: Middleware, actions: Dictionary<ActionCreator>): () => import("redux").Store<S, import("redux").AnyAction> & {
    dispatch: {};
};
export default buildCreateStore;
//# sourceMappingURL=index.d.ts.map