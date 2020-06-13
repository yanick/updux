import tap from 'tap';
import Updux from '.';
import { action, payload } from 'ts-action';
import { expectType } from 'tsd';

const dux = new Updux({ });

const myAction = action('mine',payload<string>() );

dux.addEffect( myAction, () => () => action => {
    expectType<{payload: string; type: "mine"}>(action);
});

tap.pass("pure type checking");
