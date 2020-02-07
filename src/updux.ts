import fp from "lodash/fp";
import u from "updeep";
import { action, payload } from 'ts-action';

import buildActions from "./buildActions";
import buildInitial from "./buildInitial";
import buildMutations from "./buildMutations";

import buildCreateStore from "./buildCreateStore";
import buildMiddleware from "./buildMiddleware";
import buildUpreducer from "./buildUpreducer";
import {
  UpduxConfig,
  Dictionary,
  Action,
  ActionCreator,
  Mutation,
  Upreducer,
  UpduxDispatch,
  UpduxMiddleware,
  MutationEntry,
  EffectEntry,
  Selector
} from "./types";

import { Middleware, Store, PreloadedState } from "redux";
import buildSelectors from "./buildSelectors";

type StoreWithDispatchActions<
  S = any,
  Actions = { [action: string]: (...args: any) => Action }
> = Store<S> & {
  dispatch: { [type in keyof Actions]: (...args: any) => void };
};

export type Dux<S> = Pick<
  Updux<S>,
  | "subduxes"
  | "actions"
  | "initial"
  | "mutations"
  | "reducer"
  | "middleware"
  | "createStore"
  | "upreducer"
>;

export class Updux<S = any> {
   subduxes: Dictionary<Updux> = {};

   private local_selectors: Dictionary<Selector<S>> = {};

   initial: S;

   groomMutations: (mutation: Mutation<S>) => Mutation<S>;


   private localEffects: EffectEntry<S>[] = [];

   private localActions: Dictionary<ActionCreator> = {};

   private localMutations: Dictionary<
    Mutation<S> | [Mutation<S>, boolean | undefined]
  > = {};

  constructor(config: UpduxConfig = {}) {
    this.groomMutations = config.groomMutations || ((x: Mutation<S>) => x);

    const selectors = fp.getOr( {}, 'selectors', config ) as Dictionary<Selector>;
    Object.entries(selectors).forEach( ([name,sel]: [string,Function]) => this.addSelector(name,sel as Selector) );

    Object.entries( fp.mapValues((value: UpduxConfig | Updux) =>
      fp.isPlainObject(value) ? new Updux(value as any) : value
    )(fp.getOr({}, "subduxes", config))).forEach(
        ([slice,sub]) => this.subduxes[slice] = sub as any
    );

    const actions = fp.getOr({}, "actions", config);
    Object.entries(actions).forEach(([type, p]: [string, any]): any =>
      this.addAction(
        (p as any).type ? p : action(type, p)
      )
    );

    let effects = fp.getOr([], "effects", config);
    if (!Array.isArray(effects)) {
      effects = Object.entries(effects);
    }
    effects.forEach(effect => this.addEffect(...effect));

    this.initial = buildInitial<any>(
      config.initial,
      fp.mapValues(({ initial }) => initial)(this.subduxes)
    );

    let mutations = fp.getOr([], "mutations", config);
    if (!Array.isArray(mutations)) {
      mutations = fp.toPairs(mutations);
    }

    mutations.forEach(args => (this.addMutation as any)(...args));
  }

   get middleware(): UpduxMiddleware<S> {
    return buildMiddleware(this._middlewareEntries, this.actions);
  }

   get actions(): Dictionary<ActionCreator> {
    return buildActions([
      ...(Object.entries(this.localActions) as any),
      ...(fp.flatten(
        Object.values(this.subduxes).map(({ actions }: Updux) =>
          Object.entries(actions)
        )
      ) as any),
      ,
    ]);
  }

   get upreducer(): Upreducer<S> {
    return buildUpreducer(this.initial, this.mutations);
  }

   get reducer(): (state: S | undefined, action: Action) => S {
    return (state, action) => this.upreducer(action)(state as S);
  }

   get mutations(): Dictionary<Mutation<S>> {
    return buildMutations(this.localMutations, this.subduxes);
  }

   get subduxUpreducer() {
    return buildUpreducer(this.initial, buildMutations({}, this.subduxes));
  }

  get createStore(): () => StoreWithDispatchActions<S> {
    const actions = this.actions;

    return buildCreateStore<S>(
      this.reducer,
      this.initial as PreloadedState<S>,
      this.middleware as any,
      actions
    ) as () => StoreWithDispatchActions<S, typeof actions>;
  }

  get asDux(): Dux<S> {
    return {
      createStore: this.createStore,
      upreducer: this.upreducer,
      subduxes: this.subduxes,
      middleware: this.middleware,
      actions: this.actions,
      reducer: this.reducer,
      mutations: this.mutations,
      initial: this.initial
    };
  }

  addMutation<A extends ActionCreator=any>(
    creator: A,
    mutation: Mutation<S, A extends (...args: any[]) => infer R ? R : never>,
    isSink?: boolean
  )
  addMutation<A extends ActionCreator=any>(
    creator: string,
    mutation: Mutation<S, any>,
    isSink?: boolean
  )
  addMutation<A extends ActionCreator=any>(
    creator,
    mutation,
    isSink
  )
  {
    let c = this.addAction(creator);

    this.localMutations[c.type] = [
      this.groomMutations(mutation as any) as Mutation<S>,
      isSink
    ];
  }

  addEffect(
    creator: ActionCreator | string,
    middleware: UpduxMiddleware<S>,
    isGenerator: boolean = false
  ) {
    const c = this.addAction(creator);
    this.localEffects.push([c.type, middleware, isGenerator]);
  }

  // can be
  //addAction( actionCreator )
  // addAction( 'foo', transform )
  addAction(theaction: string, transform?: any): ActionCreator<string,any>
  addAction(theaction: string|ActionCreator<any>, transform?: never): ActionCreator<string,any>
  addAction(theaction: any,transform:any) {
    if (typeof theaction === "string") {
        if(transform !== undefined ) {
            theaction = action(theaction,transform);
        }
        else {
            theaction = this.actions[theaction] || action(theaction,payload())
        }
    }

    const already = this.actions[theaction.type];
    if( already ) {
        if ( already !== theaction ) {
        throw new Error(`action ${theaction.type} already exists`)
        }
        return already;
    }

    return this.localActions[theaction.type] = theaction;
  }

  get _middlewareEntries() {
    const groupByOrder = (mws: any) =>
      fp.groupBy(
        ([a,b, actionType]: any) =>
          ["^", "$"].includes(actionType) ? actionType : "middle",
        mws
      );

    let subs = fp.flow([
      fp.toPairs,
      fp.map(([slice, updux]) =>
        updux._middlewareEntries.map(([u, ps, ...args]: any) => [u,[slice, ...ps], ...args])
      ),
      fp.flatten,
      groupByOrder
    ])(this.subduxes);

    let local = groupByOrder(this.localEffects.map(x => [this,[], ...x]));

    return fp.flatten(
      [
        local["^"],
        subs["^"],
        local.middle,
        subs.middle,
        subs["$"],
        local["$"]
      ].filter(x => x)
    );
  }

  addSelector( name: string, selector: Selector) {
      this.local_selectors[name] = selector;
  }

   get selectors() {
        return buildSelectors(this.local_selectors, this.subduxes);
  }
}

export default Updux;
