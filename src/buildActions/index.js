import fp from 'lodash/fp';
import { ActionEffects, ActionCreator, ActionCreators, ActionMutations } from '../types';

function actionFor(type: string) {
  return ( (payload = undefined, meta = undefined) =>
    fp.pickBy(v => v !== null)({type, payload, meta})
  ) as ActionCreator;
}

export default function buildActions(
  mutations : ActionMutations = {},
  effects : ActionEffects = {},
  subActions : ActionCreators = {},
) {

  return { ...subActions,
      ...fp.fromPairs([ ...Object.keys(mutations), ...Object.keys(effects) ]
        .map( type => [ type, actionFor(type) ]))
  };

}
