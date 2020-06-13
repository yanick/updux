import fp from 'lodash/fp';
import u from 'updeep';
import {
    Mutation,
    Action,
    Dictionary,
    MutationEntry,
    Upreducer,
} from '../types';
import Updux from '..';

const composeMutations = (mutations: Mutation[]) => {
    if (mutations.length == 0) return () => state => state;

    return mutations.reduce(
        (m1, m2) => (payload: any = null, action: Action) => state =>
            m2(payload, action)(m1(payload, action)(state))
    );
};

type SubMutations = {
    [slice: string]: Dictionary<Mutation>;
};

function buildMutations(
    mutations: Dictionary<Mutation | [Mutation, boolean | undefined]> = {},
    subduxes = {},
    coduxes: Upreducer[] = []
) {
    const submuts = Object.entries(subduxes).map(
        ([slice, upreducer]: [string, any]) =>
            <Mutation>(
                ((payload, action: Action) =>
                    (u.updateIn as any)(slice, upreducer(action)))
            )
    );

    const comuts = coduxes.map(c => (payload, action: Action) => c(action));

    const subreducer = composeMutations([...submuts, ...comuts]);

    let merged = {};

    Object.entries(mutations).forEach(([type, mutation]) => {
        const [m, sink] = Array.isArray(mutation)
            ? mutation
            : [mutation, false];

        merged[type] = sink ? m : composeMutations([subreducer, m]);
    });

    if (!merged['*']) merged['*'] = subreducer;

    return merged;
}

export default buildMutations;
