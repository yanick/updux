import tap from 'tap';

import Updux from '..';
import {action, payload} from 'ts-action';

type Todo = {
    id: number;
    description: string;
    done: boolean;
};

type TodoStore = {
    next_id: number;
    todos: Todo[];
};

const todosUpdux = new Updux({
    initial: {
        next_id: 1,
        todos: [],
    } as TodoStore
});


tap.test('initial state', async t => {
    const store = todosUpdux.createStore();

    t.like(store.getState(), {
        next_id: 1,
        todos: [],
    }, 'initial state'
    );
});

