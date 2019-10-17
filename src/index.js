import fp from 'lodash/fp';
import u from 'updeep';

import { createStore, applyMiddleware } from 'redux';

function actionFor(type) {
  return (payload = null, meta = null) => {
    return fp.pickBy(v => v !== null)({type, payload, meta});
  };
}

function buildInitial({initial = {}, reducers = {}}) {
  let state = initial;

  if (fp.isPlainObject(initial)) {
    initial = fp.mergeAll([
      fp.mapValues(fp.getOr({}, 'initial'), reducers),
      initial,
    ]);
  }

  return initial;
}

function buildActions({mutations = {}, reducers = {}}) {
  let actions = fp.mergeAll(fp.map(fp.getOr({}, 'actions'), reducers)) || {};

  Object.keys(mutations).forEach(type => {
    if (!actions[type]) {
      actions[type] = actionFor(type);
    }
  });

  return actions;
}

function buildMutations({mutations = {}, reducers = {}}) {
  let subMut = {};

  for (let slice in reducers) {
    for (let mutation in reducers[slice].mutations) {
      subMut = u(
        {
          [mutation]: {
            [slice]: u.constant(reducers[slice].mutations[mutation]),
          },
        },
        subMut,
      );
    }
  }

  subMut = fp.mapValues(updates => action =>
    u(fp.mapValues(f => f(action))(updates)),
  )(subMut);

  for (let name in mutations) {
    if (subMut[name]) {
      const pre = subMut[name];

      subMut[name] = action => state =>
        mutations[name](action)(pre(action)(state));
    } else {
      subMut[name] = mutations[name];
    }
  }

  return subMut;
}

function buildMiddleware({effects={},reducers={}},{actions}) {
    return api => {

        for ( let type in actions ) {
            api.dispatch[type] = (...args) => api.dispatch( actions[type](...args) );
        }

        return original_next => {
    return [
        ...fp.toPairs(effects).map(([type,effect])=> {
        return api => next => action => {
            console.log(action);

            if( action.type !== type ) return next(action);

            return effect(api)(next)(action);
        };
    }),
        ...fp.map( 'middleware', reducers )
    ].filter(x=>x).reduceRight( (next,mw) => mw(api)(next), original_next )
    }}
}

function updux(config) {
  const dux = {};

  dux.actions = buildActions(config);

  dux.initial = buildInitial(config);

  dux.mutations = buildMutations(config);

  dux.upreducer = action => state => {
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
