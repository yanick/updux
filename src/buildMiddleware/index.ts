import fp from 'lodash/fp';

import { Middleware, MiddlewareAPI, Dispatch } from 'redux';
import { Dictionary, ActionCreator, Action, UpduxDispatch } from '../types';

const MiddlewareFor = (type: any, mw: Middleware ): Middleware => api => next => action => {
    if (type !== '*' && action.type !== type) return next(action);

    return mw(api)(next)(action);
};

type Next = (action: Action) => any;

function buildMiddleware<S=any>(
    effects : Dictionary<Middleware<{},S,UpduxDispatch>>= {},
    actions : Dictionary<ActionCreator>= {},
    subMiddlewares :Middleware<{},S,UpduxDispatch>[] = [],
): Middleware<{},S,UpduxDispatch>
 {
  return (api: MiddlewareAPI<UpduxDispatch,S>) => {

    for (let type in actions) {
      const ac = actions[type];
      api.dispatch[type] = (...args:any[]) => api.dispatch(ac(...args));
    }

    return (original_next: Next)=> {
      return [
        ...fp.toPairs(effects).map(([type, effect]) =>
            MiddlewareFor(type,effect as Middleware)
        ),
        ...subMiddlewares
      ]
        .filter(x => x)
        .reduceRight((next, mw) => mw(api)(next), original_next);
    };
  };
}

export default buildMiddleware;
