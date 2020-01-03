import fp from 'lodash/fp';
import Updux from '..';
import { Dictionary, Selector } from '../types';

function subSelectors([slice, subdux]: [string, Updux]): [string, Selector][] {
    const selectors = subdux.selectors;
    if (!selectors) return [];

    return Object.entries(
        fp.mapValues(selector => (state: any) =>
            (selector as any)(state[slice])
        )(selectors)
    );
}

export default function buildSelectors(
    localSelectors: Dictionary<Selector> = {},
    subduxes: Dictionary<Updux> = {}
) {
    return Object.fromEntries(
        [
            Object.entries(subduxes).flatMap(subSelectors),
            Object.entries(localSelectors),
        ].flat()
    );
}
