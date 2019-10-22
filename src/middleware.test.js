import updux from '.';
import u from 'updeep';

test( 'simple effect', () => {

    const tracer = jest.fn();

    const store = updux({
        effects: {
            foo: api => next => action => {
                tracer();
                next(action);
            },
        },
    }).createStore();

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch({ type: 'bar' });

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch.foo();

    expect(tracer).toHaveBeenCalled();

});

test( 'effect and sub-effect', () => {

    const tracer = jest.fn();

    const tracerEffect = signature => api => next => action => {
        tracer(signature);
        next(action);
    };

    const store = updux({
        effects: {
            foo: tracerEffect('root'),
        },
        subduxes: {
            zzz: updux({effects: {
                foo: tracerEffect('child'),
            }})
        },
    }).createStore();

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch({ type: 'bar' });

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch.foo();

    expect(tracer).toHaveBeenNthCalledWith(1,'root');
    expect(tracer).toHaveBeenNthCalledWith(2,'child');



});

test( '"*" effect', () => {

    const tracer = jest.fn();

    const store = updux({
        effects: {
            '*': api => next => action => {
                tracer();
                next(action);
            },
        },
    }).createStore();

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch({ type: 'bar' });

    expect(tracer).toHaveBeenCalled();
});

test( 'async effect', async () => {

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const tracer = jest.fn();

    const store = updux({
        effects: {
            foo: api => next => async action => {
                next(action);
                await timeout(1000);
                tracer();
            },
        },
    }).createStore();

    expect(tracer).not.toHaveBeenCalled();

    store.dispatch.foo();

    expect(tracer).not.toHaveBeenCalled();

    await timeout(1000);

    expect(tracer).toHaveBeenCalled();
});
