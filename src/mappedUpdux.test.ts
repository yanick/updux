import Updux from './updux';
import u from 'updeep';
import tap from 'tap';

const todo: any = new Updux<any>({
    mutations: {
        review: () => u({ reviewed: true }),
        done: () => u({ done: true }),
    },
});

const todos: any = new Updux({
    subduxes: { '*': todo },
});

todos.addMutation(
    todo.actions.done,
    (id, action) => u.map(u.if(u.is('id', id), todo.upreducer(action))),
    true
);

tap.test('* for mapping works', async t => {
    const reducer = todos.reducer;
    let state = [{ id: 0 }, { id: 1 }];
    state = reducer(state, todos.actions.review());
    state = reducer(state, todos.actions.done(1));

    t.same(state, [
        { id: 0, reviewed: true },
        { id: 1, reviewed: true, done: true },
    ]);
});
