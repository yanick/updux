import fp from 'lodash/fp';
import u from 'updeep';

import Updux from './updux';

export default function updux(config) {
  return new Updux(config);
}
