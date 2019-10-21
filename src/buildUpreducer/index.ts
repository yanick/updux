import fp from 'lodash/fp';
import {Mutations} from '../types';

type Upreducer = <S>(action:any) => (state:S) => S;

export default function buildUpreducer<S>(initial: S, mutations: Mutations): Upreducer {
  return (action = {}) => (state:any) => {
    if (state === null) state = initial;

    const a =
      mutations[(action as any).type] ||
      mutations['*'];

    if(!a) return state;

    return a((action as any).payload, action)(state) as S;
  };
}
