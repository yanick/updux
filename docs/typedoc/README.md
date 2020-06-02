[updux - v1.2.0](README.md) › [Globals](globals.md)

# updux - v1.2.0

# What's Updux?

So, I'm a fan of [Redux](https://redux.js.org). Two days ago I discovered
[rematch](https://rematch.github.io/rematch) alonside a few other frameworks built atop Redux. 

It has a couple of pretty good ideas that removes some of the 
boilerplate. Keeping mutations and asynchronous effects close to the 
reducer definition? Nice. Automatically infering the 
actions from the said mutations and effects? Genius!

But it also enforces a flat hierarchy of reducers -- where
is the fun in that? And I'm also having a strong love for
[Updeep](https://github.com/substantial/updeep), so I want reducer state updates to leverage the heck out of it.

All that to say, say hello to `Updux`. Heavily inspired by `rematch`, but twisted
to work with `updeep` and to fit my peculiar needs. It offers features such as

* Mimic the way VueX has mutations (reducer reactions to specific actions) and
    effects (middleware reacting to actions that can be asynchronous and/or
    have side-effects), so everything pertaining to a store are all defined
    in the space place.
* Automatically gather all actions used by the updux's effects and mutations,
    and makes then accessible as attributes to the `dispatch` object of the
    store.
* Mutations have a signature that is friendly to Updux and Immer.
* Also, the mutation signature auto-unwrap the payload of the actions for you.
* TypeScript types.

Fair warning: this package is still very new, probably very buggy,
definitively very badly documented, and very subject to changes. Caveat
Maxima Emptor.

# Synopsis

```
import updux from 'updux';

import otherUpdux from './otherUpdux';

const {
    initial,
    reducer,
    actions,
    middleware,
    createStore,
} = new Updux({ 
    initial: {
        counter: 0,
    },
    subduxes: {
        otherUpdux,
    },
    mutations: {
        inc: ( increment = 1 ) => u({counter: s => s + increment })
    },
    effects: {
        '*' => api => next => action => {
            console.log( "hey, look, an action zoomed by!", action );
            next(action);
        };
    },
    actions: {
        customAction: ( someArg ) => ({ 
            type: "custom", 
            payload: { someProp: someArg } 
        }),
    },

});

const store = createStore();

store.dispatch.inc(3);
```

# Description

Full documentation can be [found here](https://yanick.github.io/updux/docs/).

## Exporting upduxes

If you are creating upduxes that will be used as subduxes
by other upduxes, or as
[ducks](https://github.com/erikras/ducks-modular-redux)-like containers, I
recommend that you export the Updux instance as the default export:

```
import Updux from 'updux';

const updux = new Updux({ ... });

export default updux;
```

Then you can use them as subduxes like this:

```
import Updux from 'updux';
import foo from './foo'; // foo is an Updux
import bar from './bar'; // bar is an Updux as well

const updux = new Updux({
    subduxes: {
        foo, bar
    }
});
```

Or if you want to use it:

```
import updux from './myUpdux';

const {
    reducer,
    actions: { doTheThing },
    createStore,
    middleware,
} = updux;
```

## Mapping a mutation to all values of a state

Say you have a `todos` state that is an array of `todo` sub-states. It's easy
enough to have the main reducer maps away all items to the sub-reducer:

```
const todo = new Updux({
    mutations: {
        review: () => u({ reviewed: true}),
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
an object) via the special key `*`. So the todos updux above could also be
written:

```
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
    todo.actions.done, 
    (id,action) => u.map(u.if(u.is('id',id), todo.upreducer(action))), 
    true
);
```

The advantages being that the actions/mutations/effects of the subdux will be
imported by the root updux as usual, and all actions that aren't being 
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
