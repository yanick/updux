import tap from 'tap';
import Updux from '.';
import { action, payload } from 'ts-action';
import u from 'updeep';
import { produce } from 'immer';

const inc = action( 'inc');
const set_double = action( 'set_double', payload<number>() );

const dux = new Updux({
    initial: {
        x: 0,
        double: 0,
    },
    actions: {
        inc
    },
    mutations: [
        [ inc, payload => u({ x: x => x + 1 }) ],
        [ set_double, double => u({double}) ],
    ]
});

dux.addSubscription(
    store => (state,unsubscribe) => {
        if( state.x>2) return unsubscribe();

        store.dispatch(set_double(state.x*2));
    }
);

const store = dux.createStore();

store.dispatch(inc());

tap.same( store.getState(), { x:1, double: 2});

store.dispatch(inc());
store.dispatch(inc());

tap.same( store.getState(), { x:3, double: 4},'we unsubscribed');
