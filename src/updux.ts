import fp from 'lodash/fp';
import buildActions from './buildActions';
import buildInitial from './buildInitial';
import buildMutations from './buildMutations';

import { Dictionary, Mutation, ActionCreators } from './types';
import buildCreateStore from './buildCreateStore';
import buildMiddleware from './buildMiddleware';
import buildUpreducer from './buildUpreducer';

type UpduxConfig = {
    initial?: any,
    mutations?: any,
    effects?: any,
    subduxes?: {
        [ slice: string ]: UpduxConfig | Updux
    }
};

export class Updux {
    actions: ActionCreators;

    subduxes: Dictionary<Updux>;

    initial: any;

    mutations: Dictionary<Mutation>;

    createStore: Function;

    upreducer: (action:any)=>(state:any)=>any;

    reducer: <S>(state:S,action:any) => S;

    middleware: (api:any) => (next: Function) => (action: any) => any;

    constructor(config: UpduxConfig) {

        this.subduxes = fp.mapValues(
            value => fp.isPlainObject(value) ? new Updux(value as UpduxConfig) : value )(fp.getOr({},'subduxes',config)
        ) as Dictionary<Updux>;


        this.actions = buildActions(
            config.mutations,
            config.effects,
            fp.mergeAll( Object.values( this.subduxes ).map( ({ actions }) =>
                actions ) )
        )

        this.initial = buildInitial(
            config.initial, fp.mapValues( ({initial}) => initial )(this.subduxes)
        );

        this.mutations = buildMutations(
            config.mutations, this.subduxes
        );

        this.upreducer = buildUpreducer(
            this.initial, this.mutations
        );

        this.reducer = (state,action) => {
            return this.upreducer(action)(state);
        }

        this.middleware = buildMiddleware(
            config.effects,
            this.actions,
            config.subduxes,
        );

        this.createStore = buildCreateStore(this.reducer,this.initial,this.middleware,this.actions);
    }

}

export default Updux;
