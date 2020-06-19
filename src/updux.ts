import fp from 'lodash/fp';
import { action, payload, ActionCreator, ActionType } from 'ts-action';
import { AnyAction } from 'redux';

import buildInitial from './buildInitial';
import buildMutations from './buildMutations';

import buildCreateStore from './buildCreateStore';
import buildMiddleware, { effectToMw, Effect } from './buildMiddleware';
import buildUpreducer from './buildUpreducer';
import {
    UpduxConfig,
    Dictionary,
    Action,
    Mutation,
    Upreducer,
    UpduxMiddleware,
    Selector,
    Dux,
    UnionToIntersection,
    AggDuxState,
    DuxSelectors,
    DuxActions,
} from './types';

import { Store, PreloadedState } from 'redux';
import buildSelectors from './buildSelectors';

type Merge<T> = UnionToIntersection<T[keyof T]>;

type ActionsOf<U> = U extends Updux ? U['actions'] : {};

//| ActionsOf<SubduxesOf<U>[keyof SubduxesOf<U>]>
export type UpduxActions<U> = U extends Updux
    ? UnionToIntersection<
          UpduxLocalActions<U> | ActionsOf<CoduxesOf<U>[keyof CoduxesOf<U>]>
      >
    : {};

export type UpduxLocalActions<S> = S extends Updux<any, null>
    ? {}
    : S extends Updux<any, infer A>
    ? A
    : {};
export type CoduxesOf<U> = U extends Updux<any, any, any, infer S> ? S : [];

type StoreWithDispatchActions<
    S = any,
    Actions = { [action: string]: (...args: any) => Action }
> = Store<S> & {
    dispatch: { [type in keyof Actions]: (...args: any) => void };
};

function wrap_subscription(sub) {
    return (store) => {
        const sub_curried = sub(store);
        let previous: unknown;

        return (state, unsubscribe) => {
            if (state === previous) return;
            previous = state;

            return sub_curried(state, unsubscribe);
        };
    };
}

function _subscribeToStore(store: any, subscriptions: Function[] = []) {
    subscriptions.forEach((sub) => {
        const subscriber = sub(store);
        let unsub = store.subscribe(() => {
            const state = store.getState();
            return subscriber(state, unsub);
        });
    });
}

function sliced_subscription(slice, sub) {
    return (store) => {
        const sub_curried = sub(store);

        return (state, unsubscribe) =>
            sub_curried(fp.get(slice, state), unsubscribe);
    };
}

/**
 *  @public
 * `Updux` is a way to minimize and simplify the boilerplate associated with the
 * creation of a `Redux` store. It takes a shorthand configuration
 * object, and generates the appropriate reducer, actions, middleware, etc.
 * In true `Redux`-like fashion, upduxes can be made of sub-upduxes (`subduxes` for short) for different slices of the root state.
 */
export class Updux<
    S = unknown,
    A = null,
    X = unknown,
    C extends UpduxConfig = {}
> {
    subduxes: Dictionary<Dux>;
    coduxes: Dux[];

    private localSelectors: Dictionary<Selector> = {};

    private localInitial: unknown;

    groomMutations: (mutation: Mutation<S>) => Mutation<S>;

    private localEffects: Effect[] = [];

    private localActions: Dictionary<ActionCreator> = {};

    private localMutations: Dictionary<
        Mutation<S> | [Mutation<S>, boolean | undefined]
    > = {};

    private localSubscriptions: Function[] = [];

    get initial(): AggDuxState<S, C> {
        return buildInitial(
            this.localInitial,
            this.coduxes.map(({ initial }) => initial),
            fp.mapValues('initial', this.subduxes)
        ) as any;
    }

    /**
     * @param config an [[UpduxConfig]] plain object
     *
     */
    constructor(config: C = {} as C) {
        this.localInitial = config.initial ?? {};
        this.localSelectors = config.selectors ?? {};
        this.coduxes = config.coduxes ?? [];
        this.subduxes = config.subduxes ?? {};

        Object.entries(config.actions ?? {}).forEach((args) =>
            (this.addAction as any)(...args)
        );

        this.coduxes.forEach((c: any) =>
            Object.entries(c.actions).forEach((args) =>
                (this.addAction as any)(...args)
            )
        );
        Object.values(this.subduxes).forEach((c: any) => {
            Object.entries(c.actions).forEach((args) => {
                (this.addAction as any)(...args);
            });
        });

        if (config.subscriptions) {
            config.subscriptions.forEach((sub) => this.addSubscription(sub));
        }

        this.groomMutations = config.groomMutations ?? ((x: Mutation<S>) => x);

        let effects = config.effects ?? [];

        if (!Array.isArray(effects)) {
            effects = (Object.entries(effects) as unknown) as Effect[];
        }
        effects.forEach((effect) => (this.addEffect as any)(...effect));

        let mutations = config.mutations ?? [];

        if (!Array.isArray(mutations)) {
            mutations = fp.toPairs(mutations);
        }

        mutations.forEach((args) => (this.addMutation as any)(...args));

        /*

        Object.entries(selectors).forEach(([name, sel]: [string, Function]) =>
            this.addSelector(name, sel as Selector)
        );

        Object.entries(
            fp.mapValues((value: UpduxConfig | Updux) =>
                fp.isPlainObject(value) ? new Updux(value as any) : value
            )(fp.getOr({}, 'subduxes', config))
        ).forEach(([slice, sub]) => (this.subduxes[slice] = sub as any));

        const actions = fp.getOr({}, 'actions', config);
        Object.entries(actions as any).forEach(([type, p]: [string, any]): any =>
            this.addAction((p as any).type ? p : action(type, p))
        );

        */
    }

    /**
     * Array of middlewares aggregating all the effects defined in the
     * updux and its subduxes. Effects of the updux itself are
     * done before the subduxes effects.
     * Note that `getState` will always return the state of the
     * local updux.
     *
     * @example
     *
     * ```
     * const middleware = updux.middleware;
     * ```
     */
    get middleware(): UpduxMiddleware<
        AggDuxState<S, C>,
        DuxSelectors<AggDuxState<S, C>, X, C>
    > {
        const selectors = this.selectors;
        const actions = this.actions;
        return buildMiddleware(
            this.localEffects.map((effect) =>
                effectToMw(effect, actions as any, selectors as any)
            ),
            (this.coduxes as any).map(fp.get('middleware')) as any,
            fp.mapValues('middleware', this.subduxes)
        ) as any;
    }

    /**
     * Action creators for all actions defined or used in the actions, mutations, effects and subduxes
     * of the updux config.
     *
     * Non-custom action creators defined in `actions` have the signature `(payload={},meta={}) => ({type,
     * payload,meta})` (with the extra sugar that if `meta` or `payload` are not
     * specified, that key won't be present in the produced action).
     *
     * The same action creator can be included
     * in multiple subduxes. However, if two different creators
     * are included for the same action, an error will be thrown.
     *
     * @example
     *
     * ```
     * const actions = updux.actions;
     * ```
     */
    get actions(): DuxActions<A, C> {
        // UpduxActions<Updux<S,A,SUB,CO>> {
        return this.localActions as any;
    }

    get upreducer(): Upreducer<S> {
        return buildUpreducer(this.initial, this.mutations as any) as any;
    }

    /**
     * A Redux reducer generated using the computed initial state and
     * mutations.
     */
    get reducer(): (state: S | undefined, action: Action) => S {
        return (state, action) => this.upreducer(action)(state as S);
    }

    /**
     * Merge of the updux and subduxes mutations. If an action triggers
     * mutations in both the main updux and its subduxes, the subduxes
     * mutations will be performed first.
     */
    get mutations(): Dictionary<Mutation<S>> {
        return buildMutations(
            this.localMutations,
            fp.mapValues('upreducer', this.subduxes as any),
            fp.map('upreducer', this.coduxes as any)
        );
    }

    /**
     * Returns the upreducer made of the merge of all sudbuxes reducers, without
     * the local mutations. Useful, for example, for sink mutations.
     *
     * @example
     *
     * ```
     * import todo from './todo'; // updux for a single todo
     * import Updux from 'updux';
     * import u from 'updeep';
     *
     * const todos = new Updux({ initial: [], subduxes: { '*': todo } });
     * todos.addMutation(
     *     todo.actions.done,
     *     ({todo_id},action) => u.map( u.if( u.is('id',todo_id) ), todos.subduxUpreducer(action) )
     *     true
     * );
     * ```
     *
     *
     *
     */
    get subduxUpreducer() {
        return buildUpreducer(this.initial, buildMutations({}, this.subduxes));
    }

    /**
     * Returns a `createStore` function that takes two argument:
     * `initial` and `injectEnhancer`. `initial` is a custom
     * initial state for the store, and `injectEnhancer` is a function
     * taking in the middleware built by the updux object and allowing
     * you to wrap it in any enhancer you want.
     *
     * @example
     *
     * ```
     * const createStore = updux.createStore;
     *
     * const store = createStore(initial);
     * ```
     *
     *
     *
     */
    createStore(...args: any) {
        const store = buildCreateStore<AggDuxState<S, C>, DuxActions<A, C>>(
            this.reducer as any,
            this.middleware as any,
            this.actions
        )(...args);

        _subscribeToStore(store, this.subscriptions);

        return store;
    }

    /**
      * Returns an array of all subscription functions registered for the dux.
      * Subdux subscriptions are wrapped such that they are getting their
      * local state. Also all subscriptions are further wrapped such that
      * they are only called when the local state changed
      */
    get subscriptions() {
        let subscriptions = ([
            this.localSubscriptions,
            Object.entries(this.subduxes).map(([slice, subdux]) => {
                return subdux.subscriptions.map((sub) =>
                    sliced_subscription(slice, sub)
                );
            }),
        ] as any).flat(Infinity);

        return subscriptions.map((sub) => wrap_subscription(sub));
    }

    /**
     * Returns a <a href="https://github.com/erikras/ducks-modular-redux">ducks</a>-like
     * plain object holding the reducer from the Updux object and all
     * its trimmings.
     *
     * @example
     *
     * ```
     * const {
     *     createStore,
     *     upreducer,
     *     subduxes,
     *     coduxes,
     *     middleware,
     *     actions,
     *     reducer,
     *     mutations,
     *     initial,
     *     selectors,
     *     subscriptions,
     * } = myUpdux.asDux;
     * ```
     *
     *
     *
     *
     */
    get asDux() {
        return {
            createStore: this.createStore,
            upreducer: this.upreducer,
            subduxes: this.subduxes,
            coduxes: this.coduxes,
            middleware: this.middleware,
            actions: this.actions,
            reducer: this.reducer,
            mutations: this.mutations,
            initial: this.initial,
            selectors: this.selectors,
            subscriptions: this.subscriptions,
        };
    }

    /**
     * Adds a mutation and its associated action to the updux.
     *
     * @param isSink - If `true`, disables the subduxes mutations for this action. To
     * conditionally run the subduxes mutations, check out [[subduxUpreducer]]. Defaults to `false`.
     *
     * @remarks
     *
     * If a local mutation was already associated to the action,
     * it will be replaced by the new one.
     *
     *
     * @example
     *
     * ```js
     * updux.addMutation(
     *     action('ADD', payload<int>() ),
     *     inc => state => state + in
     * );
     * ```
     */
    addMutation<A extends ActionCreator>(
        creator: A,
        mutation: Mutation<S, ActionType<A>>,
        isSink?: boolean
    );
    addMutation<A extends ActionCreator = any>(
        creator: string,
        mutation: Mutation<S, any>,
        isSink?: boolean
    );
    addMutation<A extends ActionCreator = any>(creator, mutation, isSink) {
        const c = this.addAction(creator);

        this.localMutations[c.type] = [
            this.groomMutations(mutation as any) as Mutation<S>,
            isSink,
        ];
    }

    addEffect<AC extends ActionCreator>(
        creator: AC,
        middleware: UpduxMiddleware<
            AggDuxState<S, C>,
            DuxSelectors<AggDuxState<S, C>, X, C>,
            ReturnType<AC>
        >,
        isGenerator?: boolean
    );
    addEffect(
        creator: string,
        middleware: UpduxMiddleware<
            AggDuxState<S, C>,
            DuxSelectors<AggDuxState<S, C>, X, C>
        >,
        isGenerator?: boolean
    );
    addEffect(creator, middleware, isGenerator = false) {
        const c = this.addAction(creator);
        this.localEffects.push([c.type, middleware, isGenerator] as any);
    }

    // can be
    //addAction( actionCreator )
    // addAction( 'foo', transform )
    /**
     * Adds an action to the updux. It can take an already defined action
     * creator, or any arguments that can be passed to `actionCreator`.
     * @example
     * ```
     *     const action = updux.addAction( name, ...creatorArgs );
     *     const action = updux.addAction( otherActionCreator );
     * ```
     * @example
     * ```
     * import {actionCreator, Updux} from 'updux';
     *
     * const updux = new Updux();
     *
     * const foo = updux.addAction('foo');
     * const bar = updux.addAction( 'bar', (x) => ({stuff: x+1}) );
     *
     * const baz = actionCreator( 'baz' );
     *
     * foo({ a: 1});  // => { type: 'foo', payload: { a: 1 } }
     * bar(2);        // => { type: 'bar', payload: { stuff: 3 } }
     * baz();         // => { type: 'baz', payload: undefined }
     * ```
     */
    addAction(theaction: string, transform?: any): ActionCreator<string, any>;
    addAction(
        theaction: string | ActionCreator<any>,
        transform?: never
    ): ActionCreator<string, any>;
    addAction(actionIn: any, transform: any) {
        let name: string;
        let creator: ActionCreator;

        if (typeof actionIn === 'string') {
            name = actionIn;

            if (transform) {
                creator = transform.type
                    ? transform
                    : action(name, (...args: any) => ({
                          payload: transform(...args),
                      }));
            } else {
                creator = this.localActions[name] ?? action(name, payload());
            }
        } else {
            name = actionIn.type;
            creator = actionIn;
        }

        const already = this.localActions[name];

        if (!already)
            return ((this.localActions as any)[name] = creator) as any;

        if (already !== creator && already.type !== '*') {
            throw new Error(`action ${name} already exists`);
        }

        return already;
    }

    get _middlewareEntries() {
        const groupByOrder = (mws: any) =>
            fp.groupBy(
                ([, , actionType]: any) =>
                    ['^', '$'].includes(actionType) ? actionType : 'middle',
                mws
            );

        const subs = fp.flow([
            fp.toPairs,
            fp.map(([slice, updux]) =>
                updux._middlewareEntries.map(([u, ps, ...args]: any) => [
                    u,
                    [slice, ...ps],
                    ...args,
                ])
            ),
            fp.flatten,
            groupByOrder,
        ])(this.subduxes);

        const local = groupByOrder(
            this.localEffects.map((x) => [this, [], ...x])
        );

        return fp.flatten(
            [
                local['^'],
                subs['^'],
                local.middle,
                subs.middle,
                subs['$'],
                local['$'],
            ].filter((x) => x)
        );
    }

    addSelector(name: string, selector: Selector) {
        this.localSelectors[name] = selector;
    }

    /**
A dictionary of the updux's selectors. Subduxes'
selectors are included as well (with the mapping to the
sub-state already taken care of you).
     */
    get selectors(): DuxSelectors<AggDuxState<S, C>, X, C> {
        return buildSelectors(
            this.localSelectors,
            fp.map('selectors', this.coduxes),
            fp.mapValues('selectors', this.subduxes)
        ) as any;
    }

    /**
      * Add a subscription to the dux.
      */
    addSubscription(subscription: Function) {
        this.localSubscriptions = [...this.localSubscriptions, subscription];
    }
}

export default Updux;
