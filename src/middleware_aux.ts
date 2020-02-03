import Updux from '.';

const updux = new Updux({
    subduxes: {
        foo: { initial: "banana" }
    }
});

updux.addEffect('*', api => next => action => {
    next({...action, meta: "gotcha" });
});

export default updux;
