import fp from 'lodash/fp';
import { Action, ActionPayloadGenerator, Dictionary } from '../types';

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

type ActionPair = [ string, ActionCreator ];

function buildActions(
  generators : Dictionary<ActionPayloadGenerator> = {},
  actionNames: string[] = [],
  subActions : ActionPair[] = [],
):Dictionary<ActionCreator> {

    // priority => generics => generic subs => craft subs => creators

  const [ crafted, generic ] = fp.partition(
      ([type,f]) => !f._genericAction
  )( subActions );

    const actions = [
        ...(actionNames.map( type => [ type, actionFor(type) ] )),
        ...generic,
        ...crafted,
        ...Object.entries(generators).map(
            ([type, payload]: [ string, Function ]) => [type, (...args: any) => ({ type, payload: payload(...args) })]
        ),
    ];

    return fp.fromPairs(actions);

}

export default buildActions;
