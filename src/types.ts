import { Dispatch, Middleware } from 'redux';

export type Action = {
    type: string,
    payload?: any,
    meta?: any,
}

export type Dictionary<T> = { [key: string]: T };

export type Mutation<S=any> = (payload: any, action: Action) => (state: S) => S ;

export type ActionPayloadGenerator = (...args:any[]) => any;

export type ActionCreator = (...args: any[] ) => Action;

export type UpduxDispatch = Dispatch & Dictionary<ActionCreator>;

export type UpduxConfig<S=any> = Partial<{
    initial: S,
    subduxes: {},
    actions: {
        [ type: string ]: ActionPayloadGenerator
    },
    mutations: any,
    effects: Dictionary<Middleware<{},S,UpduxDispatch>>,
}>;

export type Upreducer<S=any> = (action:Action) => (state:S) => S;
