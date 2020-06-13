import fp from 'lodash/fp';

import { Dictionary, Mutation, Action, Upreducer } from '../types';

function buildUpreducer<S>(initial: S, mutations: Dictionary<Mutation<S>> ): Upreducer<S> {
  return (action :Action) => (state: S) => {
    if (state === undefined) state = initial;

    const a =
      mutations[action.type] ||
      mutations['*'];

    if(!a) return state;

    return a(action.payload, action)(state);
  };
}

export default buildUpreducer;
