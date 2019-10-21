
export type Dictionary<T> = { [key: string]: T };

export type Mutation = (payload: any, action: any) => (state:any) => any;

export type Mutations = Dictionary<Mutation>;

