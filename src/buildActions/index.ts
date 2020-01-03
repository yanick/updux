import fp from "lodash/fp";
import {
  Action,
  ActionCreator,
  ActionPayloadGenerator,
  Dictionary
} from "../types";

export function actionCreator<T extends string, P extends any>(
  type: T,
  transform: (...args: any[]) => P
): ActionCreator<T, P>;
export function actionCreator<T extends string>(
  type: T,
  transform: null
): ActionCreator<T, null>;
export function actionCreator<T extends string>(
  type: T
): ActionCreator<T, undefined>;
export function actionCreator(type: any, transform?: any) {
  if (transform) {
    return Object.assign(
      (...args: any[]) => ({ type, payload: transform(...args) }),
      { type }
    );
  }

  if (transform === null) {
    return Object.assign(() => ({ type }), { type });
  }

  return Object.assign((payload: unknown) => ({ type, payload }), { type });
}

export function actionFor(type: string): ActionCreator {
  const f = (payload = undefined, meta = undefined) =>
    fp.pickBy(v => v !== undefined)({ type, payload, meta }) as Action;

  return Object.assign(f, {
    _genericAction: true,
    type
  });
}

type ActionPair = [string, ActionCreator];

function buildActions(actions: ActionPair[] = []): Dictionary<ActionCreator> {
  // priority => generics => generic subs => craft subs => creators

  const [crafted, generic] = fp.partition(([type, f]) => !f._genericAction)(
    fp.compact(actions)
  );

  return fp.fromPairs([...generic, ...crafted]);
}

export default buildActions;
