import {
  createStore as reduxCreateStore,
  applyMiddleware,
  Middleware,
  Reducer,
  PreloadedState,
  Store,
} from 'redux';

function buildCreateStore<S,A = {}>(
  reducer: Reducer<S>,
  middleware: Middleware,
  actions: A = {} as A,
): (initial?: S, injectEnhancer?: Function) => Store<S> & { actions: A } {
  return function createStore(initial?: S, injectEnhancer?: Function ): Store<S> & { actions: A } {

    let enhancer = injectEnhancer ? injectEnhancer(middleware) : applyMiddleware(middleware);

    const store = reduxCreateStore(
      reducer,
      initial as PreloadedState<S>,
      enhancer
    );

    (store as any).actions = actions;

    return store as any;
  };
}

export default buildCreateStore;
