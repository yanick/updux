
export type Action = {
    type: string,
    payload?: any,
    meta?: any,
}

export type Dictionary<T> = { [key: string]: T };

export type Mutation<S> = (payload: any, action: Action) => (state: S) => S ;

export type UpduxConfig = Partial<{
}>;
