import fp from 'lodash/fp';
import {
    ActionCreator,
    Dictionary,
} from '../types';

type ActionPair = [string, ActionCreator];

function buildActions(actions: ActionPair[] = []): Dictionary<ActionCreator> {
    // priority => generics => generic subs => craft subs => creators

    const [crafted, generic] = fp.partition(([type, f]) => !f._genericAction)(
        fp.compact(actions)
    );

    return fp.fromPairs([...generic, ...crafted]);
}

export default buildActions;
