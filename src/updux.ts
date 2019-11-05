import fp from 'lodash/fp';
import u from 'updeep';
import {observable, computed, toJS} from 'mobx';

import buildActions from './buildActions';
import buildInitial from './buildInitial';
import buildMutations from './buildMutations';

import buildCreateStore from './buildCreateStore';
import buildMiddleware from './buildMiddleware';
import buildUpreducer from './buildUpreducer';
import {
  UpduxConfig,
  Dictionary,
  Action,
  ActionCreator,
  Mutation,
  Upreducer,
  UpduxDispatch,
} from './types';

import {Middleware, Store} from 'redux';
export {actionCreator} from './buildActions';

type StoreWithDispatchActions<
  S = any,
  Actions = {[action: string]: (...args: any) => Action}
> = Store<S> & {
  dispatch: {[type in keyof Actions]: (...args: any) => void};
};

export type Dux<S> = Pick<
  Updux<S>,
  | 'subduxes'
  | 'actions'
  | 'initial'
  | 'mutations'
  | 'reducer'
  | 'middleware'
  | 'createStore'
  | 'upreducer'
>;

/**
 * `Updux` is a way to minimize and simplify the boilerplate associated with the
 * creation of a `Redux` store. It takes a shorthand configuration
 * object, and generates the appropriate reducer, actions, middleware, etc.
 * In true `Redux`-like fashion, upduxes can be made of sub-upduxes (`subduxes` for short) for different slices of the root state.
 * @typeparam S Store's state type. Defaults to `any`.
 */
export class Updux<S = any> {
  subduxes: Dictionary<Updux>;

  /**
   * Default initial state of the reducer. If applicable, merges the
   * initial states of `config` and `subduxes`, with `config` having
   * precedence.
   *
   * If nothing was provided, defaults to an empty object.
   */
  initial: S;

  /**
   * Function that can be provided to alter all local mutations of the updux
   * (the mutations of subduxes are left untouched).
   *
   * Can be used, for example, for Immer integration:
   *
   * ```
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
   *
   * ```
   *
   * Or perhaps for debugging:
   *
   * ```
   * import Updux from 'updux';
   *
   * const updux = new Updux({
   *     initial: { counter: 0 },
   *     groomMutations: mutation => (...args) => state => {
   *         console.log( "got action ", args[1] );
   *         return mutation(...args)(state);
   *     }
   * });
   *
   * ```
   */
  groomMutations: (mutation: Mutation<S>) => Mutation<S>;

  @observable private localEffects: Dictionary<
    Middleware<{}, S, UpduxDispatch>
  >;

  @observable private localActions: Dictionary<ActionCreator>;

  @observable private localMutations: Dictionary<
    Mutation<S> | [Mutation<S>, boolean | undefined]
  >;

  constructor(config: UpduxConfig = {}) {
    this.groomMutations = config.groomMutations || ((x: Mutation<S>) => x);

    this.subduxes = fp.mapValues((value: UpduxConfig | Updux) =>
      fp.isPlainObject(value) ? new Updux(value) : value,
    )(fp.getOr({}, 'subduxes', config)) as Dictionary<Updux>;

    this.localActions = fp.getOr({}, 'actions', config);

    this.localEffects = fp.getOr({}, 'effects', config);

    this.initial = buildInitial<any>(
      config.initial,
      fp.mapValues(({initial}) => initial)(this.subduxes),
    );

    this.localMutations = fp.mapValues((m: Mutation<S>) =>
      this.groomMutations(m),
    )(fp.getOr({}, 'mutations', config));
  }

  /**
   * A middleware aggregating all the effects defined in the
   * updux and its subduxes. Effects of the updux itself are
   * done before the subduxes effects.
   */
  @computed get middleware(): Middleware<{}, S, UpduxDispatch> {
    return buildMiddleware(
      this.localEffects,
      this.actions,
      Object.values(this.subduxes).map(sd => sd.middleware),
    );
  }

  /**
   * Action creators for all actions defined or used in the actions, mutations, effects and subduxes
   * of the updux config.
   *
   * Non-custom action creators defined in `actions` have the signature `(payload={},meta={}) => ({type,
   * payload,meta})` (with the extra sugar that if `meta` or `payload` are not
   * specified, the key is not present in the produced action).
   *
   * If the same action appears in multiple locations, the precedence order
   * determining which one will prevail is
   *
   *     actions generated from mutations/effects < non-custom subduxes actions <
   *     custom subduxes actions < custom actions
   */
  @computed get actions(): Dictionary<ActionCreator> {
    return buildActions(
      this.localActions,
      [...Object.keys(this.localMutations), ...Object.keys(this.localEffects)],
      fp.flatten(
        Object.values(this.subduxes).map(({actions}: Updux) =>
          Object.entries(actions),
        ),
      ),
    );
  }

  @computed get upreducer(): Upreducer<S> {
    return buildUpreducer(this.initial, this.mutations);
  }

  /**
   * A Redux reducer generated using the computed initial state and
   * mutations.
   */
  @computed get reducer(): (state: S | undefined, action: Action) => S {
    return (state, action) => this.upreducer(action)(state as S);
  }

  /**
   * Merge of the updux and subduxes mutations. If an action triggers
   * mutations in both the main updux and its subduxes, the subduxes
   * mutations will be performed first.
   */
  @computed get mutations(): Dictionary<Mutation<S>> {
    return buildMutations(this.localMutations, this.subduxes);
  }

  /**
   * Same as doing
   *
   * ```
   * import { createStore, applyMiddleware } from 'redux';
   *
   * const { initial, reducer, middleware, actions } = updox(...);
   *
   * const store = createStore( initial, reducer, applyMiddleware(middleware) );
   *
   * for ( let type in actions ) {
   *     store.dispatch[type] = (...args) => {
   *         store.dispatch(actions[type](...args))
   *     };
   * }
   * ```
   *
   * So that later on you can do
   *
   * ```
   * store.dispatch.addTodo(...);
   *
   * // still work
   * store.dispatch( actions.addTodo(...) );
   */
  @computed get createStore(): () => StoreWithDispatchActions<S> {
    const actions = this.actions;

    return buildCreateStore<S>(
      this.reducer,
      this.initial,
      this.middleware as Middleware,
      this.actions,
    ) as () => StoreWithDispatchActions<S, typeof actions>;
  }

  /**
   * Returns a
   * [ducks](https://github.com/erikras/ducks-modular-redux)-like
   * plain object holding the reducer from the Updux object and all
   * its trimmings.
   */
  get asDux(): Dux<S> {
    return {
      createStore: this.createStore,
      upreducer: this.upreducer,
      subduxes: this.subduxes,
      middleware: this.middleware,
      actions: this.actions,
      reducer: this.reducer,
      mutations: this.mutations,
      initial: this.initial,
    };
  }

  /**
   * Adds a mutation and its associated action to the updux.
   * If a local mutation was already associated to the action,
   * it will be replaced by the new one.
   * @param isSink
   * If `true`, disables the subduxes mutations for this action.
   * @example
   * ```
   * updux.addMutation( add, inc => state => state + inc );
   * ```
   */
  addMutation<A extends ActionCreator>(
    creator: A,
    mutation: Mutation<S, A extends (...args: any[]) => infer R ? R : never>,
    isSink?: boolean,
  ) {
    this.localActions[creator.type] = creator;
    this.localMutations[creator.type] = [
      this.groomMutations(mutation as any) as Mutation<S>,
      isSink,
    ];
  }
}

export default Updux;
