import { createStore as reduxCreateStore, applyMiddleware } from 'redux';

export default function buildCreateStore( reducer, initial, middleware,
                                        actions ) {
    return () => {
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
};
