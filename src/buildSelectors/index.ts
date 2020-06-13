import fp from 'lodash/fp';
import Updux from '..';
import { Dictionary, Selector } from '../types';

function subSelectors([slice, selectors]: [string, Function]): [string, Selector][] {
    if (!selectors) return [];

    return Object.entries(
        fp.mapValues(selector => (state: any) =>
            (selector as any)(state[slice])
        )(selectors as any)
    );
}

export default function buildSelectors(
    localSelectors: Dictionary<Selector> = {},
    coduxes: Dictionary<Selector>[] = [],
    subduxes: Dictionary<Selector> = {}
) {
    return Object.fromEntries(
        [
            Object.entries(subduxes).flatMap(subSelectors),
            Object.entries(coduxes),
            Object.entries(localSelectors),
        ].flat()
    );
}
