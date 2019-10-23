import fp from 'lodash/fp';
import { Action } from '../types';

interface ActionCreator {
    ( ...args: any[] ): Action;
    _genericAction?: boolean
}

function actionFor(type:string) {
  const creator : ActionCreator = ( (payload = undefined, meta = undefined) =>
    fp.pickBy(v => v !== undefined)({type, payload, meta}) as Action
  );

  creator._genericAction = true;

  return creator;
}

export default function buildActions(
  creators : { [action: string]: Function } = {},
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
            ([type, payload]: [ string, Function ]) => [type, (...args: any) => ({ type, payload: payload(...args) })]
        ),
    ];

    return fp.fromPairs(actions);

}
