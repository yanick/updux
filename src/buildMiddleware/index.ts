import fp from 'lodash/fp';

import { Middleware, MiddlewareAPI, Dispatch } from 'redux';
import { Dictionary, ActionCreator, Action, UpduxDispatch, UpduxMiddleware } from '../types';

const MiddlewareFor = (type: any, mw: Middleware ): Middleware => api => next => action => {
    if (type !== '*' && action.type !== type) return next(action);

    return mw(api)(next)(action);
};

type Next = (action: Action) => any;

function sliceMw( slice: string, mw: Middleware ): Middleware {
    return (api) => {
        const getSliceState = () => fp.get(slice, api.getState() );
        const getRootState = (api as any).getRootState || api.getState;
        return mw({...api, getState: getSliceState, getRootState} as any )
    };
}

function buildMiddleware<S=any>(
    effects : Dictionary<Middleware<{},S,UpduxDispatch>>= {},
    actions : Dictionary<ActionCreator>= {},
    subduxes :any = {},
): UpduxMiddleware<S>
 {

    const subMiddlewares = fp.flow(
        fp.mapValues( fp.get('middleware') ),
        fp.toPairs,
        fp.filter(x=>x[1]),
        fp.map( ([ slice, mw ]: [ string, Middleware]) => sliceMw(slice,mw) )
    )( subduxes );

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
