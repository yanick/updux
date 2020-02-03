import fp from "lodash/fp";

import { Middleware, MiddlewareAPI, Dispatch } from "redux";
import {
  Dictionary,
  ActionCreator,
  Action,
  UpduxDispatch,
  UpduxMiddleware,
  UpduxMiddlewareAPI,
  EffectEntry
} from "../types";
import Updux from "..";

const MiddlewareFor = (
  type: any,
  mw: Middleware
): Middleware => api => next => action => {
  if (!["*", "^", "$"].includes(type) && action.type !== type)
    return next(action);

  return mw(api)(next)(action);
};

type Next = (action: Action) => any;

function sliceMw(slice: string, mw: Middleware, updux: Updux): Middleware {
  return api => {
    const getSliceState =
      slice.length > 0 ? () => fp.get(slice, api.getState()) : api.getState;
    const getRootState = (api as any).getRootState || api.getState;
    return mw({ ...api, getState: getSliceState, getRootState,
        selectors: updux.selectors } as any);
  };
}

function buildMiddleware<S = any>(
  middlewareEntries: any[] = [],
  actions: Dictionary<ActionCreator> = {}
): UpduxMiddleware<S> {
  let mws = middlewareEntries
    .map(([updux, slice, actionType, mw, isGen]: any) =>
      isGen ? [updux, slice, actionType, mw()] : [updux, slice, actionType, mw]
    )
    .map(([updux, slice, actionType, mw]) =>
      MiddlewareFor(actionType, sliceMw(slice, mw, updux))
    );

  return (api: UpduxMiddlewareAPI<S>) => {
    for (let type in actions) {
      const ac = actions[type];
      api.dispatch[type] = (...args: any[]) => api.dispatch(ac(...args));
    }

    return (original_next: Next) => {
      return mws.reduceRight((next, mw) => mw(api)(next), original_next);
    };
  };
}

export default buildMiddleware;
