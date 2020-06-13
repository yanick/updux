import { Dispatch, Middleware } from 'redux';
export declare type Action = {
    type: string;
    payload?: any;
    meta?: any;
};
export declare type Dictionary<T> = {
    [key: string]: T;
};
export declare type Mutation<S = any> = (payload: any, action: Action) => (state: S) => S;
export declare type ActionPayloadGenerator = (...args: any[]) => any;
export declare type ActionCreator = (...args: any[]) => Action;
export declare type UpduxDispatch = Dispatch & Dictionary<ActionCreator>;
export declare type UpduxConfig<S = any> = Partial<{
    initial: S;
    subduxes: {};
    actions: {
        [type: string]: ActionPayloadGenerator;
    };
    mutations: any;
    effects: Dictionary<Middleware<{}, S, UpduxDispatch>>;
}>;
export declare type Upreducer<S = any> = (action: Action) => (state: S) => S;
//# sourceMappingURL=types.d.ts.map