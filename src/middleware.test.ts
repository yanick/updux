import Updux from '.';
import u from 'updeep';

test( 'simple effect', () => {

    const tracer = jest.fn();

    const store = (new Updux({
        effects: {
            foo: (api:any) => (next:any) => (action:any) => {
                tracer();
                next(action);
            },
        },
    })).createStore();

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch({ type: 'bar' });

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch.foo();

    expect(tracer).toHaveBeenCalled();

});

test( 'effect and sub-effect', () => {

    const tracer = jest.fn();

    const tracerEffect = ( signature: string ) => ( api:any ) => (next:any) => ( action: any ) => {
        tracer(signature);
        next(action);
    };

    const store = (new Updux({
        effects: {
            foo: tracerEffect('root'),
        },
        subduxes: {
            zzz: {effects: {
                foo: tracerEffect('child'),
            }
            }
        },
    })).createStore();

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch({ type: 'bar' });

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch.foo();

    expect(tracer).toHaveBeenNthCalledWith(1,'root');
    expect(tracer).toHaveBeenNthCalledWith(2,'child');

});

test( '"*" effect', () => {

    const tracer = jest.fn();

    const store = (new Updux({
        effects: {
            '*': api => next => action => {
                tracer();
                next(action);
            },
        },
    })).createStore();

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch({ type: 'bar' });

    expect(tracer).toHaveBeenCalled();
});

test( 'async effect', async () => {

    function timeout(ms:number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const tracer = jest.fn();

    const store = (new Updux({
        effects: {
            foo: api => next => async action => {
                next(action);
                await timeout(1000);
                tracer();
            },
        },
    })).createStore();

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch.foo();

    expect(tracer).not.toHaveBeenCalled();

    await timeout(1000);

    expect(tracer).toHaveBeenCalled();
});
