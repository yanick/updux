import fp from 'lodash/fp';

const MiddlewareFor = (type,mw) => api => next => action => {
    if (type !== '*' && action.type !== type) return next(action);

    return mw(api)(next)(action);
};

export default function buildMiddleware(
    effects = {},
    actions = {},
    subduxes = {},
) {
  return api => {
    for (let type in actions) {
      api.dispatch[type] = (...args) => api.dispatch(actions[type](...args));
    }

    return original_next => {
      return [
        ...fp.toPairs(effects).map(([type, effect]) =>
            MiddlewareFor(type,effect)
        ),
        ...fp.map('middleware', subduxes),
      ]
        .filter(x => x)
        .reduceRight((next, mw) => mw(api)(next), original_next);
    };
  };
}
