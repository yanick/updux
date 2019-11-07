import {Dispatch, Middleware} from 'redux';

type MaybePayload<P> = P extends object | string | boolean | number
  ? {
      payload: P;
    }
  : {payload?: P};

export type Action<T extends string = string, P = any> = {
  type: T;
} & MaybePayload<P>;

export type Dictionary<T> = {[key: string]: T};

export type Mutation<S = any, A extends Action = Action> = (
  payload: A['payload'],
  action: A,
) => (state: S) => S;

export type ActionPayloadGenerator = (...args: any[]) => any;

export type ActionCreator<T extends string = string, P = any> = {
  type: T;
  _genericAction?: boolean;
} & ((...args: any[]) => Action<T, P>);

export type UpduxDispatch = Dispatch & Dictionary<Function>;


/**
  * Configuration object given to Updux's constructor.
  * @typeparam S Type of the Updux's state. Defaults to `any`.
  */
export type UpduxConfig<S=any> = {
  /**
   * The default initial state of the reducer. Can be anything your
   * heart desires.
   */
  initial?: S;

  /**
   * Object mapping slices of the state to sub-upduxes.
   *
   * For example, if in plain Redux you would do
   *
   * ```
   * import { combineReducers } from 'redux';
   * import todosReducer from './todos';
   * import statisticsReducer from './statistics';
   *
   * const rootReducer = combineReducers({
   *     todos: todosReducer,
   *     stats: statisticsReducer,
   * });
   * ```
   *
   * then with Updux you'd do
   *
   * ```
   * import { updux } from 'updux';
   * import todos from './todos';
   * import statistics from './statistics';
   *
   * const rootUpdux = updux({
   *     subduxes: {
   *         todos, statistics
   *     }
   * });
   */
  subduxes?: {};

  /**
   * Generic action creations are automatically created from the mutations and effects, but you can
   * also define custom action creator here. The object's values are function that
   * transform the arguments of the creator to the action's payload.
   *
   * ```
   * const { actions } = updox({
   *     mutations: {
   *         foo: () => state => state,
   *     }
   *     actions: {
   *         bar: (x,y) => ({x,y})
   *     }
   * });
   *
   * actions.foo({ x: 1, y: 2 }); // => { type: foo, payload: { x:1, y:2  } }
   * actions.bar(1,2);            // => { type: bar, payload: { x:1, y:2  } }
   * ```
   */

  actions?: {
    [type: string]: ActionCreator;
  };

  /**
   * Object mapping actions to the associated state mutation.
   *
   * For example, in `Redux` you'd do
   *
   * ```
   * function todosReducer(state=[],action) {
   *
   *     switch(action.type) {
   *         case 'ADD':  return [ ...state, action.payload ];
   *
   *         case 'DONE': return state.map( todo => todo.id === action.payload
   *             ? { ...todo, done: true } : todo )
   *
   *         default: return state;
   *     }
   * }
   * ```
   *
   * With Updux:
   *
   * ```
   * const todosUpdux = updux({
   *     mutations: {
   *         add: todo => state => [ ...state, todo ],
   *         done: done_id => u.map( u.if( ({id} => id === done_id), {done: true} ) )
   *     }
   * });
   * ```
   *
   * The signature of the mutations is `(payload,action) => state => newState`.
   * It is designed to play well with `Updeep` (and [Immer](https://immerjs.github.io/immer/docs/introduction)). This way, instead of doing
   *
   * ```
   *     mutation: {
   *         renameTodo: newName => state => { ...state, name: newName }
   *     }
   * ```
   *
   * we can do
   *
   * ```
   *     mutation: {
   *         renameTodo: newName => u({ name: newName })
   *     }
   * ```
   *
   * Also, the special key `*` can be used to match any
   * action not explicitly matched by other mutations.
   *
   * ```
   * const todosUpdux = updux({
   *     mutations: {
   *         add: todo => state => [ ...state, todo ],
   *         done: done_id => u.map( u.if( ({id} => id === done_id), {done: true} ) ),
   *         '*' (payload,action) => state => {
   *             console.warn( "unexpected action ", action.type );
   *             return state;
   *         },
   *     }
   * });
   */
  mutations?: any;

  groomMutations?: (m: Mutation<S>) => Mutation<S>;

  /**
   * Plain object defining asynchronous actions and side-effects triggered by actions.
   * The effects themselves are Redux middleware, expect with the `dispatch`
   * property of the first argument augmented with all the available actions.
   *
   * ```
   * updux({
   *     effects: {
   *         fetch: ({dispatch}) => next => async (action) => {
   *             next(action);
   *
   *             let result = await fetch(action.payload.url).then( result => result.json() );
   *             dispatch.fetchSuccess(result);
   *         }
   *     }
   * });
   * ```
   *
   */
  effects?: Dictionary<UpduxMiddleware<S>>;
};

export type Upreducer<S = any> = (action: Action) => (state: S) => S;

export interface UpduxMiddlewareAPI<S> {
    dispatch: UpduxDispatch,
    getState(): any,
    getRootState(): S

}
export type UpduxMiddleware<S=any> = (api: UpduxMiddlewareAPI<S> ) => ( next: UpduxDispatch ) => ( action: Action ) => any;

