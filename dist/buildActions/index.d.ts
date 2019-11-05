import { ActionCreator, ActionPayloadGenerator, Dictionary } from '../types';
export declare function actionCreator<T extends string, P extends any>(type: T, transform: (...args: any[]) => P): ActionCreator<T, P>;
export declare function actionCreator<T extends string>(type: T, transform: never): ActionCreator<T, undefined>;
export declare function actionCreator<T extends string>(type: T, transform: null): ActionCreator<T, null>;
declare type ActionPair = [string, ActionCreator];
declare function buildActions(generators?: Dictionary<ActionPayloadGenerator>, actionNames?: string[], subActions?: ActionPair[]): Dictionary<ActionCreator>;
export default buildActions;
//# sourceMappingURL=index.d.ts.map