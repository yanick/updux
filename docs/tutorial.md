# Tutorial

This tutorial walks you through the features of `Updux` using the 
time-honored example of the implementation of Todo list store.

This tutorial assumes that our project is written in TypeScript, and 
that we are using [updeep](https://www.npmjs.com/package/updeep) to 
help with immutability and deep merging and [ts-action][] to manage our
actions. This is the recommended setup, but 
none of those two architecture
decisions are mandatory; Updux is equally usable in a pure-JavaScript setting,
and `updeep` can easily be substitued by, say, [immer][], [lodash][], or even
just plain JavaScript. Eventually, I plan to write a version of this tutorial
with all those different configurations.

Also, the code used here is also available in the project repository, in the 
`src/tutorial` directory.

## Definition of the state

First thing first: let's define the type of our store:

```
type Todo = {
    id: number;
    description: string;
    done: boolean;
};

type TodoStore = {
    next_id: number;
    todos: Todo[];
};
```

With that, let's create our very first Updux:

```
import Updux from 'updux';

const todosUpdux = new Updux({
    initial: {
        next_id: 1,
        todos: [],
    } as TodoStore
});
```

Note that we explicitly cast the initial state as `as TodoStore`. This lets 
Updux know what is the store's state.

This being said, congrats! You have written your first Updux object. It
doesn't do a lot, but you can already create a store out of it, and its
initial state will be automatically set:

```
const store = todosUpdux.createStore();

console.log(store.getState()); 
// { next_id: 1, todos: [] }
```

## Add actions

This is all good, but a little static. Let's add actions!

```
import { action, payload } from 'ts-action';

const add_todo  = action('add_todo', payload<string>() );
const todo_done = action('todo_done', payload<number>() );
```

Now, there is a lot of ways to add actions to a Updux object. 

It can be defined when the object is created:

```
const todosUpdux = new Updux({
    actions: {
        add_todo,
        todo_done,
    }
});
```

It can be done via the method `addAction`:

```
todosUpdux.addAction(add_todo);
```

Or it can be directly used in the definition of a mutation or effect, and will
be automatically added to the Updux.

```
todosUpdux.addMutation( add_todo, todoMutation );
```

For TypeScript projects I recommend declaring the actions as part of the
configuration passed to the constructors, as it makes them accessible to the class
at compile-time, and allow Updux to auto-add them to its aggregated `actions` type.


```
const todosUpdux = new Updux({
    actions: {
        add_todo,
    }
});

todosUpdux.addAction(todo_done);

// only `add_todo` is visible to the type
type MyActions = typeof todosUpdux.actions;
// { add_todo: Function }

// but both actions are accessible at runtime
const myAction = ( todosUpdux.actions as any).todo_done(1);
```

### Accessing actions

Once an action is defined, its creator is accessible via the `actions` accessor. 

```
console.log( todosUpdux.actions.add_todo('write tutorial') );
// { type: 'add_todo', payload: 'write tutorial' }
```

### What is an action?

In this tutorial we use `ts-action` for all the work, but under the hood Updux defines actions via
their creators, which are expected to be:

1. Functions,
2. returning a plain object of the format `{ type: string; payload?: unknown }`.
3. with an additional property `type`, which is also the action type.

For example, this is a perfectly cromulent action:

```
const add_todo = description => ({ type: 'add_todo', payload: description});
add_todo.type = 'add_todo';
```

## Mutations

Actions that don't do anything are not fun. The transformations typically
done by a Redux's reducer are called 'mutations' in Updux. A mutation is a
function with the following signature:

```
( payload, action ) => state => {
    // ... stuff done here
    return new_state;
}
```

The inversion and chaining of parameters from the usual Redux reducer's
signature is there to work with `updeep`'s curried nature. The expansion of
the usual `action` into `(payload, action)` is present because in most cases
`payload` is what we're interested in. So why not make it easily available?

### Adding a mutation

As for the actions, a mutation can be defined as part of the Updux
init arguments:

```
const add_todo_mutation = description => ({next_id: id, todos}) => {
    return {
        next_id: 1 + id,
        todos: [...todos, { description, id, done: false }]
    }

};

const todosUpdux = new Updux({
    actions: { add_todo },
    mutations: [
        [ add_todo, add_todo_mutation ]
    ]
});
```

or via the method `addMutation`:

```
todos.addMutation( add_todo, description => ({next_id: id, todos}) => {
    return {
        next_id: 1 + id,
        todos: [...todos, { description, id, done: false }]
    }
});
```

This time around, if the project is using TypeScript then the addition of 
mutations via `addMutation` is encouraged, as the method signature 
has visibility of the types of the action and state.

### Leftover mutation

A mutation with the special action `*` will match any action that haven't been
explicitly dealt with with any other defined mutation.

```
todosUpdux.addMutation( '*', (payload,action) => state => {
    console.log("hey, action has no mutation! ", action.type);
});
```


## Effects

In addition of mutations, Updux also provide action-specific middleware, here
called effects.

Effects use the usual Redux middleware signature:

```
import u from 'updeep';

// we want to decouple the increment of next_id and the creation of 
// a new todo. So let's use a new version of the action 'add_todo'.

const add_todo_with_id = action('add_todo_with_id', payload<{description: string; id?: number}>() );
const inc_next_id = action('inc_next_id');

const populate_next_id = ({ getState, dispatch }) => next => action => { 
    const { next_id: id } = getState();

    dispatch(inc_next_id());
    next(action);
    dispatch( add_todo_with_id({ description: action.payload, id }) );
}
```

And just like mutations, they can be defined as part of the init
configuration, or after via the method `addEffect`:

```
const todosUpdux = new Updux({
    actions: { add_todo, inc_next_id },
    effects: [
        [ add_todo, populate_next_id ]
    ]
})
```

or

```
const todosUpdux = new Updux({
    actions: { add_todo, inc_next_id },
});

todosUpdux.addEffect( add_todo, populate_next_id );
```

As for the mutations, for TypeScript projects 
the use of `addEffect` is prefered, as the method gives visibility of the 
action and state types.

### Catch-all effect

It is possible to have an effect match all actions via the special `*` token. 

```
todosUpdux.addEffect('*', () => next => action => {
    console.log( 'seeing action fly by:', action );
    next(action);
});
```

## Selectors

Selectors can be defined to get data derived from the state.

### Adding selectors

From now you should know the drill: selectors can be defined at construction
time or via `addSelector`.

```
import fp from 'lodash/fp';

const getTodoById = ({todos}) => id => fp.find({id},todos);

const todosUpdux = new Updux({
    selectors: {
       getTodoById 
    }
})
```

or 

```
todosUpdux.addSelector('getTodoById', ({todos}) => id => fp.find({id},todos));
```

Here the declaration as part of the constructor configuration is prefered.
Whereas the `addSelector` will provides the state's type as part of its
signature, declaring the selectors via the constructors will make them visible
via the type of the accessors `selectors`.

### Accessing selectors

Selectors are available via the accessor `selectors`.

```
const store = todosUpdux.createStore();

console.log(  
    todosUpdux.selectors.getTodoById( store.getState() )(1)
);
```

## Subduxes

Now that we have all the building blocks, we can embark on the last, and best,
part of Updux: its recursive nature.

### Recap: the Todos updux, undivided

Upduxes can be divided into sub-upduxes that deal with the various parts of
the global state. This is better understood by working out an example, so
let's recap on the Todos Updux we have so far:

```
import Updux from 'updux';
import { action, payload } from 'ts-action';
import u from 'updeep';
import fp from 'lodash/fp';

type Todo = {
    id: number;
    description: string;
    done: boolean;
};

type TodoStore = {
    next_id: number;
    todos: Todo[];
};

const add_todo  = action('add_todo', payload<string>() );
const add_todo_with_id  = action('add_todo_with_id', 
    payload<{ description: string; id: number }>() );
const todo_done = action('todo_done', payload<number>() );
const inc_next_id = action('inc_next_id');

const todosUpdux = new Updux({
    initial: {
        next_id: 1,
        todos: [],
    } as TodoStore,
    actions: {
        add_todo,
        add_todo_with_id,
        todo_done,
        inc_next_id,
    },
    selectors: {
        getTodoById: ({todos}) => id => fp.find({id},todos)
    }
});

todosUpdux.addMutation( add_todo_with_id, payload => 
    u.updateIn( 'todos', todos => [ ...todos, { ...payload, done: false }] )
);

todosUpdux.addMutation( inc_next_id, () => u({ next_id: i => i + 1 }) );

todosUpdux.addMutation( todo_done, id => u.updateIn(
    'todos', u.map( u.if( fp.matches({id}), todo => u({done: true}, todo) ) )
) ); 

todosUpdux.addEffect( add_todo, ({ getState, dispatch }) => next => action => { 
    const { next_id: id } = getState();

    dispatch(inc_next_id());

    next(u.updateIn('payload', {id}, action))
});

```

This store has two main components: the `next_id`, and the `todos` collection.
The `todos` collection is itself composed of the individual `todo`s. So let's
create upduxes for each of those.

### Next_id updux

```
// dux/next_id.ts

import Updux from 'updux';
import { action, payload } from 'ts-action';
import u from 'updeep';
import fp from 'lodash/fp';

const inc_next_id = action('inc_next_id');

const updux = new Updux({
    initial: 1,
    actions: {
        inc_next_id,
    },
    selectors: {
        getNextId: state => state
    }
});

updux.addMutation( inc_next_id, () => fp.add(1) );

export default updux.asDux;

```

Notice that here we didn't have to specify what is the type of `initial`;
TypeScript figures by itself that it's a number.

Also, note that we're exporting the output of the accessor `asDux` instead of
the updux object itself. See the upcoming section 'Exporting upduxes' for the rationale.

### Todo updux

```
// dux/todos/todo/index.ts

import Updux from 'updux';
import { action, payload } from 'ts-action';
import u from 'updeep';
import fp from 'lodash/fp';

type Todo = {
    id: number;
    description: string;
    done: boolean;
};

const todo_done = action('todo_done', payload<number>() );

const updux = new Updux({
    initial: {
        next_id: 0,
        description: "",
        done: false,
    } as Todo,
    actions: {
        todo_done
    }
});

updux.addMutation( todo_done, id => u.if( fp.matches({id}), { done: true }) );

export default updux.asDux;

```

### Todos updux

```
// dux/todos/index.ts

import Updux, { DuxState } from 'updux';
import { action, payload } from 'ts-action';
import u from 'updeep';
import fp from 'lodash/fp';

import todo from './todo';

type TodoState = DuxState<typeof todo>;

const add_todo_with_id  = action('add_todo_with_id', 
    payload<{ description: string; id: number }>() 
);

const updux = new Updux({
    initial: [] as Todo[],
    subduxes: {
       '*': todo.upreducer 
    },
    actions: {
        add_todo_with_id,
    },
    selectors: {
        getTodoById: state => id => fp.find({id},state)
    }
});

todosUpdux.addMutation( add_todo_with_id, payload => 
    todos => [ ...todos, { ...payload, done: false }]
);

export default updux.asDux;
```

Note the special '*' subdux key used here. This
allows the updux to map every item present in its
state to a `todo` updux. See [this recipe](/recipes?id=mapping-a-mutation-to-all-values-of-a-state) for details.
We could also have written the updux as:

```
const updux = new Updux({
    initial: [] as Todo[],
    actions: {
        add_todo_with_id,
    },
    selectors: {
        getTodoById: state => id => fp.find({id},state)
    },
    mutations: {
        '*': (payload,action) => state => u.map( todo.reducer(state, action) )
    }
});
```

Note how we are using the `upreducer` accessor in the first case (which yields
a reducer for the dux using the signature `(payload,action) => state =>
new_state`) and `reducer` in the second case (which yield an equivalent
reducer using the classic signature `(state,action) => new_state`).


### Main store

```
// dux/index.ts

import Updux from 'updux';

import todos from './todos';
import next_id from './next_id';

const add_todo  = action('add_todo', payload<string>() );

const updux = new Updux({
    subduxes: {
        next_id,
        todos,
    },
    actions: {
        add_todo
    }
});

todos.addEffect( add_todo, ({ getState, dispatch }) => next => action => { 
    const id = updux.selectors.getNextId( getState() );

    dispatch(updux.actions.inc_next_id());

    next(action);

    dispatch( updux.actions.add_todo_with_id({ description: action.payload, id }) );
});

export default updux.asDux;

```

Tadah! We had to define the `add_todo` effect at the top level as it needs to 
access the `getNextId` selector from `next_id` and the `add_todo_with_id`
action from the `todos`. 

Note that the `getNextId` selector still get the
rigth value; when aggregating subduxes selectors Updux auto-wrap them to
access the right slice of the top object. I.e., the `getNextId` selector
at the main level is actually defined as:

```
const getNextId = state => next_id.selectors.getNextId(state.next_id);
```

## Exporting upduxes

As a general rule, don't directly export your upduxes, but rather use the accessor `asDux`.

```
const updux = new Updux({ ... });

...

export default updux.asDux;
```

`asDux` returns an immutable copy of the attributes of the updux. Exporting
this instead of the updux itself prevents unexpected modifications done
outside of the updux declaration file. More importantly, the output of
`asDux` has more precise typing, which in result results in better typing of 
parent upduxes using the dux as one of its subduxes.

[immer]: https://www.npmjs.com/package/immer
[lodash]: https://www.npmjs.com/package/lodash
[ts-action]: https://www.npmjs.com/package/ts-action
