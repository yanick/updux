import fp from 'lodash/fp';
import u from 'updeep';

import Updux from './updux';




function updux(config) {
  return new Updux(config);
  // const actions = buildActions(
  //     config.mutations,
  //     config.effects,
  //     fp.flatten( ( config.subduxes||{}).map( ({ actions }) => actions ) )
  // );

  // const initial = buildInitial(config);

  // const mutations = buildMutations(config.mutations,config.subduxes);



  // return {
  //     reducer,
  //     upreducer,
  //     middleware,
  //     createStore,
  //     actions: ( actions as any ),
  //     mutations,
  //     initial,
  // };
}

export default updux;
