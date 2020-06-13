import { Action, ActionPayloadGenerator, Dictionary } from '../types';
interface ActionCreator {
    (...args: any[]): Action;
    _genericAction?: boolean;
}
declare type ActionPair = [string, ActionCreator];
declare function buildActions(generators?: Dictionary<ActionPayloadGenerator>, actionNames?: string[], subActions?: ActionPair[]): Dictionary<ActionCreator>;
export default buildActions;
//# sourceMappingURL=index.d.ts.map