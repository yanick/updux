import Updux, {dux} from '.';

const updux = new Updux({
    subduxes: {
        foo: dux({ initial: "banana" })
    }
});

updux.addEffect('*', () => next => action => {
    next({...action, meta: "gotcha" });
});

export default updux;
