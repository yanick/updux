import fp from 'lodash/fp';
import u from 'updeep';
import {Mutation, Action, Dictionary} from '../types';

const composeMutations = (mutations: Mutation[]) =>
  mutations.reduce((m1, m2) => (payload: any = null, action: Action) => state =>
    m2(payload, action)(m1(payload, action)(state)),
  );

type SubMutations = {
    [ slice: string ]: Dictionary<Mutation>
}

function buildMutations(
    mutations :Dictionary<Mutation> = {},
    subduxes = {}
) {
  // we have to differentiate the subduxes with '*' than those
  // without, as the root '*' is not the same as any sub-'*'

  const actions = fp.uniq(
    Object.keys(mutations).concat(
      ...Object.values(subduxes).map(({mutations = {}}:any) =>
        Object.keys(mutations),
      ),
    ),
  );

  let mergedMutations :Dictionary<Mutation[]> = {};

  let [globby, nonGlobby] = fp.partition(
    ([_, {mutations = {}}]:any) => mutations['*'],
    Object.entries(subduxes),
  );

  globby = fp.flow([
    fp.fromPairs,
    fp.mapValues(({reducer}) => (_:any, action :Action) => ( state: any ) =>
      reducer(state, action),
    ),
  ])(globby);

  const globbyMutation = (payload:any, action:Action) =>
    u(fp.mapValues((mut:any) => mut(payload, action))(globby));

  actions.forEach(action => {
    mergedMutations[action] = [globbyMutation];
  });

  nonGlobby.forEach(([slice, {mutations = {}, reducer = {}}]:any[]) => {
    Object.entries(mutations).forEach(([type, mutation]) => {
      const localized = (payload = null, action :Action) =>
        u.updateIn(slice)((mutation as Mutation)(payload, action));

      mergedMutations[type].push(localized);
    });
  });

  Object.entries(mutations).forEach(([type, mutation]) => {
    mergedMutations[type].push(mutation);
  });

  return fp.mapValues(composeMutations)(mergedMutations);
}

export default buildMutations;
