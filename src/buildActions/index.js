import fp from 'lodash/fp';

function actionFor(type) {
  return ( (payload = undefined, meta = undefined) =>
    fp.pickBy(v => v !== null)({type, payload, meta})
  );
}

export default function buildActions(
  mutations = {},
  effects = {},
  subActions = {},
) {

  return { ...subActions,
      ...fp.fromPairs([ ...Object.keys(mutations), ...Object.keys(effects) ]
        .map( type => [ type, actionFor(type) ]))
  };

}
