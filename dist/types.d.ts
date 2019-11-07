import { Dispatch } from 'redux';
declare type MaybePayload<P> = P extends object | string | boolean | number ? {
    payload: P;
} : {
    payload?: P;
};
export declare type Action<T extends string = string, P = any> = {
    type: T;
} & MaybePayload<P>;
export declare type Dictionary<T> = {
    [key: string]: T;
};
export declare type Mutation<S = any, A extends Action = Action> = (payload: A['payload'], action: A) => (state: S) => S;
export declare type ActionPayloadGenerator = (...args: any[]) => any;
export declare type ActionCreator<T extends string = string, P = any> = {
    type: T;
    _genericAction?: boolean;
} & ((...args: any[]) => Action<T, P>);
export declare type UpduxDispatch = Dispatch & Dictionary<Function>;
export declare type UpduxConfig<S = any> = {
    initial?: S;
    subduxes?: {};
    actions?: {
        [type: string]: ActionCreator;
    };
    mutations?: any;
    groomMutations?: (m: Mutation<S>) => Mutation<S>;
    effects?: Dictionary<UpduxMiddleware<S>>;
};
export declare type Upreducer<S = any> = (action: Action) => (state: S) => S;
export interface UpduxMiddlewareAPI<S> {
    dispatch: UpduxDispatch;
    getState(): any;
    getRootState(): S;
}
export declare type UpduxMiddleware<S = any> = (api: UpduxMiddlewareAPI<S>) => (next: UpduxDispatch) => (action: Action) => any;
export {};
//# sourceMappingURL=types.d.ts.map