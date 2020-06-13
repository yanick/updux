import Updux from "./updux";
import { UpduxConfig, Dux, Dictionary, Selector, Mutation, AggDuxState, Action,
    Upreducer, UpduxMiddleware, DuxActions, DuxSelectors } from "./types";

import {Creator} from 'ts-action';
import { AnyAction, Store } from 'redux';

export { default as Updux } from "./updux";
export { UpduxConfig, DuxState } from "./types";
export { subEffects } from './buildMiddleware';
export * from './types';

export default Updux;

export const coduxes = <C extends Dux, U extends [C,...C[]]>(...coduxes: U): { coduxes: U } => ({
    coduxes });

export const dux = <S=unknown,A=unknown,X=unknown,C extends UpduxConfig= {}>(config: C  ) => {
/// : Dux<S,A,X,C> => {
    return ( new Updux<S,A,X,C>(config) ).asDux;
}

