import fp from 'lodash/fp';

import { Middleware } from 'redux';
import { Dictionary, ActionCreator, Action } from '../types';

const MiddlewareFor = (type: any, mw: Middleware ): Middleware => api => next => action => {
    if (type !== '*' && action.type !== type) return next(action);

    return mw(api)(next)(action);
};

type Next = (action: Action) => any;

function buildMiddleware(
    effects: Dictionary<Middleware>,
    actions: Dictionary<ActionCreator>,
    subMiddlewares: Middleware[],
): Middleware
function buildMiddleware(
    effects = {},
    actions = {},
    subduxes = {},
) {
  return (api: any) => {
    for (let type in actions) {
      api.dispatch[type] = (...args:any[]) => api.dispatch(((actions as any)[type] as any)(...args));
    }

    return (original_next: Next)=> {
      return [
        ...fp.toPairs(effects).map(([type, effect]) =>
            MiddlewareFor(type,effect as Middleware)
        ),
        ...fp.map('middleware', subduxes),
      ]
        .filter(x => x)
        .reduceRight((next, mw) => mw(api)(next), original_next);
    };
  };
}

export default buildMiddleware;
