import fp from 'lodash/fp';
import u from 'updeep';

import Updux from './updux';

import { UpduxConfig } from './types';

export default function updux(config: UpduxConfig) {
  return new Updux(config);
}
