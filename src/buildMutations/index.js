import fp from 'lodash/fp';
import u from 'updeep';

const composeMutations = (mutations) =>
    mutations.reduce( (m1,m2) =>
        (payload=null,action={}) => state => m2(payload,action)(
            m1(payload,action)(state) ));

export default function buildMutations(mutations = {}, subduxes= {}) {
  // we have to differentiate the subduxes with '*' than those
  // without, as the root '*' is not the same as any sub-'*'

    const actions = fp.uniq( Object.keys(mutations).concat(
        ...Object.values( subduxes ).map( ({mutations = {}}) => Object.keys(mutations) )
    ) );

    let mergedMutations = {};

    let [ globby, nonGlobby ] = fp.partition(
        ([_,{mutations={}}]) => mutations['*'],
        Object.entries(subduxes)
    );

    globby =
        fp.flow([
            fp.fromPairs,
            fp.mapValues(
        ({reducer}) => (_,action={}) => state =>
            reducer(state,action) ),
        ])(globby);

    const globbyMutation = (payload,action) => u(
        fp.mapValues( (mut) => mut(payload,action) )(globby)
    );

    actions.forEach( action => {
        mergedMutations[action] = [ globbyMutation ]
    });

    nonGlobby.forEach( ([slice, {mutations={},reducer={}}]) => {
        Object.entries(mutations).forEach(([type,mutation]) => {
            const localized = (payload=null,action={}) => u.updateIn( slice )( (mutation)(payload,action) );

            mergedMutations[type].push(localized);
        })
    });

    Object.entries(mutations).forEach(([type,mutation]) => {
            mergedMutations[type].push(mutation);
    });

    return fp.mapValues( composeMutations )(mergedMutations);
}
