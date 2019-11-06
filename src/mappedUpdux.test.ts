import Updux from './updux';
import u from 'updeep';

const todo = new Updux({
    mutations: {
        review: () => u({ reviewed: true}),
        done: () => u({done: true}),
    },
});

const todos = new Updux({
    subduxes: { '*': todo },
});

todos.addMutation(
    todo.actions.done, (id,action) => u.map(u.if(u.is('id',id), todo.upreducer(action))), true
);

test( '* for mapping works', () => {
    const reducer = todos.reducer;
    let state = [ { id: 0 }, {id: 1 } ];
    state = reducer( state, todos.actions.review() );
    state = reducer( state, todos.actions.done(1) );

    expect(state).toEqual([
        { id: 0, reviewed: true },
        { id: 1, reviewed: true, done: true },
    ]);
});
