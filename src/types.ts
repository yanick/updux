
export type Action = {
    type: string,
    payload?: any,
    meta?: any,
}

export type Dictionary<T> = { [key: string]: T };

export type Mutation<S=any> = (payload: any, action: Action) => (state: S) => S ;

type ActionPayloadGenerator = (...args:any[]) => any;

export type ActionCreator = (...args: any[] ) => Action;

export type UpduxConfig = Partial<{
    subduxes: {},
    actions: {
        [ type: string ]: ActionPayloadGenerator
    },
    mutations: any,
    effects: any,
}>;
