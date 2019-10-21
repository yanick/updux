import fp from 'lodash/fp';
import u from 'updeep';

import { createStore as reduxCreateStore, applyMiddleware } from 'redux';

import buildMiddleware from './buildMiddleware';

function actionFor(type) {
  return (payload = null, meta = null) => {
    return fp.pickBy(v => v !== null)({type, payload, meta});
  };
}

function buildInitial({initial = {}, subduxes = {}}) {
  let state = initial;

  if (fp.isPlainObject(initial)) {
    initial = fp.mergeAll([
      fp.mapValues(fp.getOr({}, 'initial'), subduxes),
      initial,
    ]);
  }

  return initial;
}

function buildActions({mutations = {}, effects = {}, subduxes = {}}) {
  let actions = fp.mergeAll(fp.map(fp.getOr({}, 'actions'), subduxes)) || {};

  Object.keys(mutations).forEach(type => {
    if (!actions[type]) {
      actions[type] = actionFor(type);
    }
  });

  Object.keys(effects).forEach(type => {
    if (!actions[type]) {
      actions[type] = actionFor(type);
    }
  });

  return actions;
}

const composeMutations = mutations =>
    mutations.reduce( (m1,m2) =>
        (payload=null,action={}) => state => m2(payload,action)(
            m1(payload,action)(state) ));

function buildMutations({mutations = {}, subduxes= {}}: any) {
  // we have to differentiate the subduxes with '*' than those
  // without, as the root '*' is not the same as any sub-'*'

    const actions = fp.uniq( Object.keys(mutations).concat(
        ...Object.values( subduxes ).map( ({mutations = {}}:any) => Object.keys(mutations) )
    ) );

    let mergedMutations = {};

    let [ globby, nonGlobby ] = fp.partition(
        ([_,{mutations={}}]:any) => mutations['*'],
        Object.entries(subduxes)
    );

    globby =
        fp.flow([
            fp.fromPairs,
            fp.mapValues(
        ({reducer}) => (_,action={}) => state =>
            reducer(state,action) ),
        ])(globby);

    const globbyMutation = (payload,action) => u(
        fp.mapValues( (mut:any) => mut(payload,action) )(globby)
    );

    actions.forEach( action => {
        mergedMutations[action] = [ globbyMutation ]
    });

    nonGlobby.forEach( ([slice, {mutations={},reducer={}}]:any) => {
        Object.entries(mutations).forEach(([type,mutation]) => {
            const localized = (payload=null,action={}) => u.updateIn( slice )( (mutation as any)(payload,action) );

            mergedMutations[type].push(localized);
        })
    });

    Object.entries(mutations).forEach(([type,mutation]) => {
            mergedMutations[type].push(mutation);
    });

    return fp.mapValues( composeMutations )(mergedMutations);

}

function updux(config) {
  const actions = buildActions(config);

  const initial = buildInitial(config);

  const mutations = buildMutations(config);

  const upreducer = (action={}) => state => {
    if (state === null) state = initial;

    const a =
      mutations[(action as any).type] ||
      mutations['*'] ||
      (() => state => state);

    return a((action as any).payload, action)(state);
  };

  const reducer = (state, action) => {
    return upreducer(action)(state);
  };

  const middleware = buildMiddleware(
      config.effects,
      actions,
      config.subduxes,
  );

  const createStore = () => {
      const store =  reduxCreateStore( reducer, initial,
          applyMiddleware( middleware)
        );
      for ( let a in actions ) {
          store.dispatch[a] = (...args) => {
              store.dispatch(actions[a](...args))
          };
      }

      return store;
  }

  return {
      reducer,
      upreducer,
      middleware,
      createStore,
      actions,
      mutations,
      initial,
  };
}

export default updux;
