import { UpduxConfig, Dictionary, Action, ActionCreator, Mutation, Upreducer, UpduxMiddleware } from './types';
import { Store } from 'redux';
export { actionCreator } from './buildActions';
declare type StoreWithDispatchActions<S = any, Actions = {
    [action: string]: (...args: any) => Action;
}> = Store<S> & {
    dispatch: {
        [type in keyof Actions]: (...args: any) => void;
    };
};
export declare type Dux<S> = Pick<Updux<S>, 'subduxes' | 'actions' | 'initial' | 'mutations' | 'reducer' | 'middleware' | 'createStore' | 'upreducer'>;
export declare class Updux<S = any> {
    subduxes: Dictionary<Updux>;
    initial: S;
    groomMutations: (mutation: Mutation<S>) => Mutation<S>;
    private localEffects;
    private localActions;
    private localMutations;
    constructor(config?: UpduxConfig);
    readonly middleware: UpduxMiddleware<S>;
    readonly actions: Dictionary<ActionCreator>;
    readonly upreducer: Upreducer<S>;
    readonly reducer: (state: S | undefined, action: Action) => S;
    readonly mutations: Dictionary<Mutation<S>>;
    readonly subduxUpreducer: Upreducer<any>;
    readonly createStore: () => StoreWithDispatchActions<S>;
    readonly asDux: Dux<S>;
    addMutation<A extends ActionCreator>(creator: A, mutation: Mutation<S, A extends (...args: any[]) => infer R ? R : never>, isSink?: boolean): void;
}
export default Updux;
//# sourceMappingURL=updux.d.ts.map