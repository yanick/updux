import fp from 'lodash/fp';
import u from 'updeep';

import Updux from './updux';

import { UpduxConfig } from './types';

export default function updux<S=any>(config: UpduxConfig<S>) {
  return new Updux<S>(config);
}
