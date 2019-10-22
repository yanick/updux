
export type Dictionary<T> = { [key: string]: T };

export type Mutation = (payload: any, action: any) => (state:any) => any;

export type Mutations = Dictionary<Mutation>;

export type ActionMutations = Dictionary<Mutation>;

export type Effect = (api:any) => (next: Function) => (action: any) => any;

export type ActionEffects = Dictionary<Effect>;

export type Action<T = string, P = any, M = any> = {
    type: T,
    payload: P,
    meta: M,
}

export type ActionCreator = <P,M>(payload?: P, meta?: M ) => Action<string,P,M>;

export type ActionCreators = Dictionary<ActionCreator>;

