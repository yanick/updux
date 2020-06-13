import fp from 'lodash/fp';

function actionFor(type) {
  const creator = ( (payload = undefined, meta = undefined) =>
    fp.pickBy(v => v !== undefined)({type, payload, meta})
  );

  creator._genericAction = true;

  return creator;
}

export default function buildActions(
  creators = {},
  mutations = {},
  effects = {},
  subActions = [],
) {

    // priority => generics => generic subs => craft subs => creators

  const [ crafted, generic ] = fp.partition(
      ([type,f]) => !f._genericAction
  )(  fp.flatten( subActions.map( x => Object.entries(x) ) ).filter(
      ([_,f]) => f
  ) )

    const actions = [
        ...([ ...Object.keys(mutations), ...Object.keys(effects) ]
            .map( type => [ type, actionFor(type) ] )),
        ...generic,
        ...crafted,
        ...Object.entries(creators).map(
            ([type, payload]) => [type, (...args) => ({ type, payload: payload(...args) })]
        ),
    ];

    return fp.fromPairs(actions);

}
