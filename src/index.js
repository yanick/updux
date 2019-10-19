import fp from 'lodash/fp';
import u from 'updeep';

import { createStore, applyMiddleware } from 'redux';

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

function buildActions({mutations = {}, subduxes = {}}) {
  let actions = fp.mergeAll(fp.map(fp.getOr({}, 'actions'), subduxes)) || {};

  Object.keys(mutations).forEach(type => {
    if (!actions[type]) {
      actions[type] = actionFor(type);
    }
  });

  return actions;
}

const composeMutations = (m1,m2) =>
        (payload=null,action={}) => state => m2(payload,action)(
            m1(payload,action)(state) );

function buildMutations({mutations = {}, subduxes = {}}) {
  // we have to differentiate the subduxes with '*' than those
  // without, as the root '*' is not the same as any sub-'*'

    const actions = fp.uniq( Object.keys(mutations).concat(
        ...Object.values( subduxes ).map( ({mutations}) => Object.keys(mutations) )
    ) );

    // let's seed with noops
    let mergedMutations = {};

    actions.forEach( action => {
        mergedMutations[action] = () => state => state;
    });


    console.log(mergedMutations);

    Object.entries( subduxes ).forEach( ([slice, {mutations,reducer}]) => {

        if( mutations['*'] ) {
            const localized = (payload=null,action={}) => u.updateIn( slice, mutations['*'](payload,action) );
                console.log("b");
                mergedMutations = fp.mapValues(
                    mutation => composeMutations(
                        (dummy,action) => u.updateIn(slice,
                            state => reducer(state,action)
                        ), mutation )
                )(mergedMutations);
            return;
        }

        Object.entries(mutations).forEach(([type,mutation]) => {
            const localized = (payload=null,action={}) => u.updateIn( slice, mutation(payload,action) );

            if( type !== '*' ) {
                console.log("a");

                mergedMutations[type] = composeMutations(
                    localized, mergedMutations[type]
                )
            }
            else {
            }
        })
    });
    console.log(mergedMutations);

    Object.entries(mutations).forEach(([type,mutation]) => {
        console.log(type,":",mutation,":",mergedMutations[type]);

                mergedMutations[type] = composeMutations(
                    mergedMutations[type], mutation
                )
    });

    return mergedMutations;

}

function buildMiddleware({effects={},subduxes={}},{actions}) {
    return api => {

        for ( let type in actions ) {
            api.dispatch[type] = (...args) => api.dispatch( actions[type](...args) );
        }

        return original_next => {
    return [
        ...fp.toPairs(effects).map(([type,effect])=> {
        return api => next => action => {
            if( action.type !== type ) return next(action);

            return effect(api)(next)(action);
        };
    }),
        ...fp.map( 'middleware', subduxes )
    ].filter(x=>x).reduceRight( (next,mw) => mw(api)(next), original_next )
    }}
}

function updux(config) {
  const dux = {};

  dux.actions = buildActions(config);

  dux.initial = buildInitial(config);

  dux.mutations = buildMutations(config);

  dux.upreducer = (action={}) => state => {
    if (state === null) state = dux.initial;

    const a =
      dux.mutations[action.type] ||
      dux.mutations['*'] ||
      (() => state => state);

    return a(action.payload, action)(state);
  };

  dux.reducer = (state, action) => {
    return dux.upreducer(action)(state);
  };

  dux.middleware = buildMiddleware(config,dux);

  dux.createStore = () => {
      const store =  createStore( dux.reducer, dux.initial,
          applyMiddleware( dux.middleware)
        );
      for ( let a in dux.actions ) {
          store.dispatch[a] = (...args) => {
              store.dispatch(dux.actions[a](...args))
          };
      }

      return store;
  }



  return dux;
}

export default updux;
