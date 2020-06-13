import {
  createStore as reduxCreateStore,
  applyMiddleware,
  Middleware,
  Reducer,
} from 'redux';
import { ActionCreator, Dictionary } from '../types';

function buildCreateStore<S>(
  reducer: Reducer<S>,
  initial: S,
  middleware: Middleware,
  actions: Dictionary<ActionCreator>,
) {
  return () => {
    const store = reduxCreateStore(
      reducer,
      initial,
      applyMiddleware(middleware),
    );
    for (let a in actions) {
      ( store.dispatch as any)[a] = (...args: any[]) => {
        store.dispatch(actions[a](...args));
      };
    }

    return store;
  };
}

export default buildCreateStore;
