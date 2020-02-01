import fp from "lodash/fp";
import u from "updeep";

import buildActions, { actionFor, actionCreator } from "./buildActions";
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
  EffectEntry
} from "./types";

import { Middleware, Store, PreloadedState } from "redux";
export { actionCreator } from "./buildActions";

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
  subduxes: Dictionary<Updux>;

   initial: S;

   groomMutations: (mutation: Mutation<S>) => Mutation<S>;

  private localEffects: EffectEntry<S>[] = [];

  private localActions: Dictionary<ActionCreator> = {};

  private localMutations: Dictionary<
    Mutation<S> | [Mutation<S>, boolean | undefined]
  > = {};

  constructor(config: UpduxConfig = {}) {
    this.groomMutations = config.groomMutations || ((x: Mutation<S>) => x);

    this.subduxes = fp.mapValues((value: UpduxConfig | Updux) =>
      fp.isPlainObject(value) ? new Updux(value) : value
    )(fp.getOr({}, "subduxes", config)) as Dictionary<Updux>;

    const actions = fp.getOr({}, "actions", config);
    Object.entries(actions).forEach(([type, payload]: [string, any]): any =>
      this.addAction(
        (payload as any).type ? payload : actionCreator(type, payload as any)
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

  addMutation<A extends ActionCreator>(
    creator: A,
    mutation: Mutation<S, A extends (...args: any[]) => infer R ? R : never>,
    isSink?: boolean
  ) {
    let c = fp.isFunction(creator) ? creator : actionFor(creator);

    this.addAction(c);

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
    let c = fp.isFunction(creator) ? creator : actionFor(creator);

    this.addAction(c);
    this.localActions[c.type] = c;
    this.localEffects.push([c.type, middleware, isGenerator]);
  }

  addAction(action: string, transform?: any): ActionCreator<string,any>
  addAction(action: ActionCreator<any>, transform?: never): ActionCreator<string,any>
  addAction(action: any,transform:any) {
    if (typeof action === "string") {
      if (!this.localActions[action]) {
        this.localActions[action] = actionCreator(action,transform);
      }
      return this.localActions[action];
    }

    return this.localActions[action.type] = action;
  }

  get _middlewareEntries() {
    const groupByOrder = (mws: any) =>
      fp.groupBy(
        ([_, actionType]: any) =>
          ["^", "$"].includes(actionType) ? actionType : "middle",
        mws
      );

    let subs = fp.flow([
      fp.mapValues("_middlewareEntries"),
      fp.toPairs,
      fp.map(([slice, entries]) =>
        entries.map(([ps, ...args]: any) => [[slice, ...ps], ...args])
      ),
      fp.flatten,
      groupByOrder
    ])(this.subduxes);

    let local = groupByOrder(this.localEffects.map(x => [[], ...x]));

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
}

export default Updux;
