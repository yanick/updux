import fp from 'lodash/fp';

export default function buildUpreducer(initial, mutations) {
  return (action = {}) => (state) => {
    if (state === null) state = initial;

    const a =
      mutations[(action).type] ||
      mutations['*'];

    if(!a) return state;

    return a((action).payload, action)(state);
  };
}
