import fp from 'lodash/fp';
import buildActions from './buildActions';
import buildInitial from './buildInitial';
import buildMutations from './buildMutations';

import buildCreateStore from './buildCreateStore';
import buildMiddleware from './buildMiddleware';
import buildUpreducer from './buildUpreducer';
import { UpduxConfig, Dictionary, Action, ActionCreator, Mutation, Upreducer, UpduxDispatch } from './types';

import { Middleware, Store } from 'redux';

type StoreWithDispatchActions<S=any,Actions={ [action: string]: (...args:any) => Action }> = Store<S> & {
    dispatch: { [ type in keyof Actions ]: (...args:any) => void }
};

export class Updux<S=any> {

    subduxes: Dictionary<Updux>;

    actions: Dictionary<ActionCreator>

    initial: S;

    mutations: Dictionary<Mutation>;

    upreducer: Upreducer<S>;

    reducer: (state:S|undefined,action:Action) => S;

    middleware: Middleware<{},S,UpduxDispatch>;

    createStore: () => StoreWithDispatchActions<S>;

    constructor(config: UpduxConfig) {

        this.subduxes = fp.mapValues(
            (value:UpduxConfig|Updux) => fp.isPlainObject(value) ? new Updux(value) : value )(fp.getOr({},'subduxes',config)
        ) as Dictionary<Updux>;


        this.actions = buildActions(
            config.actions,
            [ ...Object.keys(config.mutations||{}), ...Object.keys(config.effects||{} ) ],
            fp.flatten( Object.values( this.subduxes ).map( ({actions}:Updux) => Object.entries(actions) ) ),
        )

        this.initial = buildInitial<any>(
            config.initial, fp.mapValues( ({initial}) => initial )(this.subduxes)
        );

        this.mutations = buildMutations(
            config.mutations, this.subduxes
        );

        this.upreducer = buildUpreducer(
            this.initial, this.mutations
        );

        this.reducer = (state,action) => {
            return this.upreducer(action)(state as S);
        }

        this.middleware = buildMiddleware(
            config.effects,
            this.actions,
            Object.values(this.subduxes).map( sd => sd.middleware )
        );

        const actions = this.actions;
        this.createStore = buildCreateStore<S>(this.reducer,this.initial,this.middleware as Middleware,this.actions) as
        () => StoreWithDispatchActions< S, typeof actions  >;
    }

}

export default Updux;
