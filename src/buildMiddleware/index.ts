import fp from 'lodash/fp';
import { ActionCreator } from 'ts-action';

import { Middleware, MiddlewareAPI, Dispatch } from 'redux';
import {
    Dictionary,
    Action,
    UpduxMiddleware,
    UpduxMiddlewareAPI,
    Selector,
} from '../types';
import Updux from '..';

const MiddlewareFor = (
    type: any,
    mw: Middleware
): Middleware => api => next => action => {
    if (!type.includes('*') && action.type !== type) return next(action);

    return mw(api)(next)(action);
};

type Next = (action: Action) => any;

function sliceMw(slice: string, mw: UpduxMiddleware): UpduxMiddleware {
    return api => {
        const getSliceState = () => fp.get(slice, api.getState());
        return mw({ ...api, getState: getSliceState } as any);
    };
}

type Submws = Dictionary<UpduxMiddleware>;

type MwGen = () => UpduxMiddleware;
export type Effect = [string, UpduxMiddleware|MwGen, boolean? ];

export const subMiddleware = () => next => action => next(action);
export const subEffects : Effect = [ '*', subMiddleware ] as any;

export const effectToMw = (
    effect: Effect,
    actions: Dictionary<ActionCreator>,
    selectors: Dictionary<Selector>,
) => {
    let [type, mw, gen]: any = effect;

    if ( mw === subMiddleware ) return subMiddleware;

    if (gen) mw = mw();

    const augmented = api => mw({ ...api, actions, selectors });

    if (type === '*') return augmented;

    return api => next => action => {
        if (action.type !== type) return next(action);

        return augmented(api)(next)(action);
    };
};

const composeMw = (mws: UpduxMiddleware[]) => (
    api: UpduxMiddlewareAPI<any>
) => (original_next: Next) =>
    mws.reduceRight((next, mw) => mw(api)(next), original_next);

export function buildMiddleware<S = unknown>(
    local: UpduxMiddleware[] = [],
    co: UpduxMiddleware[] = [],
    sub: Submws = {}
): UpduxMiddleware<S> {
    let inner = [
        ...co,
        ...Object.entries(sub).map(([slice, mw]) => sliceMw(slice, mw)),
    ];

    let found = false;
    let mws = local.flatMap(e => {
        if (e !== subMiddleware) return e;
        found = true;
        return inner;
    });

    if (!found) mws = [...mws, ...inner];

    return composeMw(mws) as UpduxMiddleware<S>;
}

export default buildMiddleware;
