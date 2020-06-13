import { ActionCreator } from 'ts-action';

type MaybePayload<P> = P extends object | string | boolean | number
    ? {
          payload: P;
      }
    : { payload?: P };

export type Action<T extends string = string, P = any> = {
    type: T;
} & MaybePayload<P>;

export type Dictionary<T> = { [key: string]: T };

export type Mutation<S = any, A extends Action = Action> = (
    payload: A['payload'],
    action: A
) => (state: S) => S;

export type ActionPayloadGenerator = (...args: any[]) => any;

export type MutationEntry = [
    ActionCreator | string,
    Mutation<any, Action<string, any>>,
    boolean?
];

export type GenericActions = Dictionary<
    ActionCreator<string, (...args: any) => { type: string }>
>;

export type UnionToIntersection<U> = (U extends any
  ? (k: U) => void
  : never) extends (k: infer I) => void
    ? I
    : never;

export type StateOf<D> = D extends { initial: infer I } ? I : unknown;

export type DuxStateCoduxes<C> = C extends Array<infer U> ? UnionToIntersection<StateOf<U>>: unknown
export type DuxStateSubduxes<C> =
    C extends { '*': infer I } ? {
        [ key: string ]: StateOf<I>,
        [ index: number ]: StateOf<I>,
} :
    C extends object ? { [ K in keyof C]: StateOf<C[K]>}: unknown;

type DuxStateGlobSub<S> = S extends { '*': infer I } ? StateOf<I> : unknown;

type LocalDuxState<S> = S extends never[] ? unknown[] : S;

/** @ignore */
type AggDuxState2<L,S,C> = (
    L extends never[] ? Array<DuxStateGlobSub<S>> : L & DuxStateSubduxes<S> ) & DuxStateCoduxes<C>;

/** @ignore */
export type AggDuxState<O,S extends UpduxConfig> = unknown extends O ?
    AggDuxState2<S['initial'],S['subduxes'],S['coduxes']> : O


type SelectorsOf<C> = C extends { selectors: infer S } ? S : unknown;

/** @ignore */
export type DuxSelectorsSubduxes<C> = C extends object ? UnionToIntersection<SelectorsOf<C[keyof C]>> : unknown;

/** @ignore */
export type DuxSelectorsCoduxes<C> = C extends Array<infer U> ? UnionToIntersection<SelectorsOf<U>> : unknown;

type MaybeReturnType<X> = X extends (...args: any) => any ? ReturnType<X> : unknown;

type RebaseSelector<S,X> = {
    [ K in keyof X]: (state: S) => MaybeReturnType< X[K] >
}

type ActionsOf<C> = C extends { actions: infer A } ? A : {};

type DuxActionsSubduxes<C> = C extends object ? ActionsOf<C[keyof C]> : unknown;
export type DuxActionsCoduxes<C> = C extends Array<infer I> ? UnionToIntersection<ActionsOf<I>> : {};

type ItemsOf<C> = C extends object? C[keyof C] : unknown

export type DuxActions<A,C extends UpduxConfig> = A extends object ? A: (
         UnionToIntersection<ActionsOf<C|ItemsOf<C['subduxes']>|ItemsOf<C['coduxes']>>>
 );

export type DuxSelectors<S,X,C extends UpduxConfig>  = unknown extends X ? (
    RebaseSelector<S,
    C['selectors'] & DuxSelectorsCoduxes<C['coduxes']> &
     DuxSelectorsSubduxes<C['subduxes']> >
): X

export type Dux<
    S = unknown,
    A = unknown,
    X = unknown,
    C = unknown,
> = {
    subduxes: Dictionary<Dux>,
    coduxes: Dux[],
    initial: AggDuxState<S,C>,
    actions: A,
}

/**
* Configuration object given to Updux's constructor.
*
* #### arguments
*
* ##### initial
*
* Default initial state of the reducer. If applicable, is merged with
* the subduxes initial states, with the parent having precedence.
*
* If not provided, defaults to an empty object.
*
* ##### actions
*
* [Actions](/concepts/Actions) used by the updux.
*
* ```js
* import { dux } from 'updux';
* import { action, payload } from 'ts-action';
*
* const bar = action('BAR', payload<int>());
* const foo = action('FOO');
*
* const myDux = dux({
*     actions: {
*         bar
*     },
*     mutations: [
*         [ foo, () => state => state ]
*     ]
* });
*
* myDux.actions.foo({ x: 1, y: 2 }); // => { type: foo, x:1, y:2 }
* myDux.actions.bar(2);              // => { type: bar, payload: 2 }
* ```
*
* New actions used directly in mutations and effects will be added to the
* dux actions -- that is, they will be accessible via `dux.actions` -- but will
* not appear as part of its Typescript type.
*
* ##### selectors
*
* Dictionary of selectors for the current updux. The updux also
* inherit its subduxes' selectors.
*
* The selectors are available via the class' getter.
*
* ##### mutations
*
*     mutations: [
*         [ action, mutation, isSink ],
*         ...
*     ]
*
* or
*
*     mutations: {
*         action: mutation,
*         ...
*     }
*
* List of mutations for assign to the dux. If you want Typescript goodness, you
* probably want to use `addMutation()` instead.
*
* In its generic array-of-array form,
* each mutation tuple contains: the action, the mutation,
* and boolean indicating if this is a sink mutation.
*
* The action can be an action creator function or a string. If it's a string, it's considered to be the
* action type and a generic `action( actionName, payload() )` creator will be
* generated for it. If an action is not already defined in the `actions`
* parameter, it'll be automatically added.
*
* The pseudo-action type `*` can be used to match any action not explicitly matched by other mutations.
*
* ```js
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
* ```
*
* The signature of the mutations is `(payload,action) => state => newState`.
* It is designed to play well with `Updeep` (and [Immer](https://immerjs.github.io/immer/docs/introduction)). This way, instead of doing
*
* ```js
*     mutation: {
*         renameTodo: newName => state => { ...state, name: newName }
*     }
* ```
*
* we can do
*
* ```js
*     mutation: {
*         renameTodo: newName => u({ name: newName })
*     }
* ```
*
* The final argument is the optional boolean `isSink`. If it is true, it'll
* prevent subduxes' mutations on the same action. It defaults to `false`.
*
* The object version of the argument can be used as a shortcut when all actions
* are strings. In that case, `isSink` is `false` for all mutations.
*
* ##### groomMutations
*
* Function that can be provided to alter all local mutations of the updux
* (the mutations of subduxes are left untouched).
*
* Can be used, for example, for Immer integration:
*
* ```js
* import Updux from 'updux';
* import { produce } from 'Immer';
*
* const updux = new Updux({
*     initial: { counter: 0 },
*     groomMutations: mutation => (...args) => produce( mutation(...args) ),
*     mutations: {
*         add: (inc=1) => draft => draft.counter += inc
*     }
* });
* ```
*
* Or perhaps for debugging:
*
* ```js
* import Updux from 'updux';
*
* const updux = new Updux({
*     initial: { counter: 0 },
*     groomMutations: mutation => (...args) => state => {
*         console.log( "got action ", args[1] );
*         return mutation(...args)(state);
*     }
* });
* ```
* ##### subduxes
*
* Object mapping slices of the state to sub-upduxes. In addition to creating
* sub-reducers for those slices, it'll make the parend updux inherit all the
* actions and middleware from its subduxes.
*
* For example, if in plain Redux you would do
*
* ```js
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
* ```js
* import { updux } from 'updux';
* import todos from './todos';
* import statistics from './statistics';
*
* const rootUpdux = updux({
*     subduxes: {
*         todos,
*         statistics
*     }
* });
* ```
*
* ##### effects
*
* Array of arrays or plain object defining asynchronous actions and side-effects triggered by actions.
* The effects themselves are Redux middleware, with the `dispatch`
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
* @example
*
* ```
* import Updux from 'updux';
* import { actions, payload } from 'ts-action';
* import u from 'updeep';
*
* const todoUpdux = new Updux({
*     initial: {
*         done: false,
*         note: "",
*     },
*     actions: {
*         finish: action('FINISH', payload()),
*         edit: action('EDIT', payload()),
*     },
*     mutations: [
*         [ edit, note => u({note}) ]
*     ],
*     selectors: {
*         getNote: state => state.note
*     },
*     groomMutations: mutation => transform(mutation),
*     subduxes: {
*         foo
*     },
*     effects: {
*         finish: () => next => action => {
*             console.log( "Woo! one more bites the dust" );
*         }
*     }
* })
* ```
*/
export type UpduxConfig = Partial<{
    initial: unknown, /** foo */
    subduxes: Dictionary<Dux>,
    coduxes: Dux[],
    actions: Dictionary<ActionCreator>,
    selectors: Dictionary<Selector>,
    mutations: any,
    groomMutations: (m: Mutation) => Mutation,
    effects: any,
}>;


export type Upreducer<S = any> = (action: Action) => (state: S) => S;

/** @ignore */
export interface UpduxMiddlewareAPI<S=any,X = Dictionary<Selector>> {
    dispatch: Function;
    getState(): S;
    selectors: X;
    actions: Dictionary<ActionCreator>;
}
export type UpduxMiddleware<S=any,X = Dictionary<Selector>,A = Action> = (
    api: UpduxMiddlewareAPI<S,X>
) => (next: Function) => (action: A) => any;

export type Selector<S = any> = (state: S) => unknown;

export type DuxState<D> = D extends { initial: infer S } ? S : unknown;
