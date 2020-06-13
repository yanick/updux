import tap from 'tap';
import { expectType } from 'tsd';

import buildCreateStore from '.';
import { action, ActionCreator } from 'ts-action';
import {Reducer} from 'redux';

const foo = action('foo');
const bar = action('bar');

type State = {
    x: number,
    y: string
}

const store = buildCreateStore(
    ((state: State|undefined) => state ?? {x: 1} ) as Reducer<State>,
    () => () => () => {return},
    { foo, bar }
)();

expectType<State>( store.getState() );
expectType<number>( store.getState().x );

expectType<{ foo: ActionCreator }>( store.actions );

tap.pass();

