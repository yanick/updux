#  Recipes

## Mapping a mutation to all values of a state

Say you have a `todos` state that is an array of `todo` sub-states. It's easy
enough to have the main reducer map away all items to the sub-reducer:

```
const todo = new Updux({
    actions: {
        review: action('REVIEW'),
        done: action('DONE',payload<int>()),
    },
    mutations: {
        review: () => u({reviewed: true}),
        done: () => u({done: true}),
    },
});

const todos = new Updux({ initial: [] });

todos.addMutation( 
    todo.actions.review, 
    (_,action) => state => state.map( todo.upreducer(action) )  
);
todos.addMutation(
    todo.actions.done, 
    (id,action) => u.map(u.if(u.is('id',id), todo.upreducer(action))),
);

```

But `updeep` can iterate through all the items of an array (or the values of
an object) via the special key `*`. So the todos updux above can be
rewritten as:

```
const todos = new Updux({
    subduxes: { '*': todo },
});

todos.addMutation(
    todo.actions.done, 
    (id,action) => u.map(u.if(u.is('id',id), todo.upreducer(action))), 
    true
);
```

The advantages being that the actions/mutations/effects of the subdux will be
imported by the root updux as usual, and all actions not
overridden by a sink mutation will trickle down automatically.

## Usage with Immer

While Updux was created with Updeep in mind, it also plays very
well with [Immer](https://immerjs.github.io/immer/docs/introduction).

For example, taking this basic updux:

```
import Updux from 'updux';

const updux = new Updux({
    initial: { counter: 0 },
    mutations: {
        add: (inc=1) => state => { counter: counter + inc } 
    }
});
    
```

Converting it to Immer would look like:


```
import Updux from 'updux';
import { produce } from 'Immer';

const updux = new Updux({
    initial: { counter: 0 },
    mutations: {
        add: (inc=1) => produce( draft => draft.counter += inc ) } 
    }
});
    
```

But since typing `produce` over and over is no fun, `groomMutations`
can be used to wrap all mutations with it:


```
import Updux from 'updux';
import { produce } from 'Immer';

const updux = new Updux({
    initial: { counter: 0 },
    groomMutations: mutation => (...args) => produce( mutation(...args) ),
    mutations: {
        add: (inc=1) => draft => draft.counter += inc 
    }
});
    
```



