import { UpduxConfig, Dictionary, Action, ActionCreator, Mutation, Upreducer, UpduxDispatch } from './types';
import { Middleware, Store } from 'redux';
declare type StoreWithDispatchActions<S = any, Actions = {
    [action: string]: (...args: any) => Action;
}> = Store<S> & {
    dispatch: {
        [type in keyof Actions]: (...args: any) => void;
    };
};
export declare class Updux<S = any> {
    subduxes: Dictionary<Updux>;
    actions: Dictionary<ActionCreator>;
    initial: S;
    mutations: Dictionary<Mutation>;
    upreducer: Upreducer<S>;
    reducer: (state: S | undefined, action: Action) => S;
    middleware: Middleware<{}, S, UpduxDispatch>;
    createStore: () => StoreWithDispatchActions<S>;
    constructor(config: UpduxConfig);
}
export default Updux;
//# sourceMappingURL=updux.d.ts.map