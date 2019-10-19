
# What's Updux?

So, I'm a fan of [Redux][]. Two days ago I discovered
[rematch](https://rematch.github.io/rematch) alonside a few other frameworks built atop Redux. 

It has a couple of pretty good ideas that removes some of the 
boilerplate. Keeping mutations and asynchronous effects close to the 
reducer definition, à la [VueX][]? Nice. Automatically infering the 
actions from the said mutations and effects? Genius!

But it also enforces a flat hierarchy of reducers -- where
is the fun in that? And I'm also having a strong love for
[Updeep][], so I want reducer state updates to leverage the heck out of it.

All that to say, I had some fun yesterday and hacked a proto-lovechild
of `Rematch` and `Updeep`, with a dash of [VueX][] inspiration. 
I call it... `Updux`.

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
} = updux({ 
    initial: {},
    subduxes: {
        otherUpdux,
    },
    mutations: {
    },
    effects: {
    },

})
```

# Description

`Updux` exports one function, `updux`, both as a named export and as
its default export.

## helpers = updux(config);

`updux` is a way to minimize and simplify the boilerplate associated with the 
creation of a `Redux` store. It takes a shorthand configuration 
object, and generates the appropriate reducer, actions, middleware, etc. 
In true `Redux`-like fashion, just like reducers can be composed
of sub-reducers, upduxs can be made of sub-upduxs.

### config

The config object recognize following properties.

#### initial

The default initial state of the reducer. Can be anything your
heart desires. 

#### subduxes

Object mapping slices of the state to sub-upduxs.

For example, if in plain Redux you would do

```
import { combineReducers } from 'redux';
import todosReducer from './todos';
import statisticsReducer from './statistics';

const rootReducer = combineReducers({
    todos: todosReducer,
    stats: statisticsReducer,
});
```

then with Updux you'd do 

```
import { updux } from 'updux';
import todos from './todos';
import statistics from './statistics';

const rootUpdux = updux({
    subduxes: {
        todos, statistics
    }
});
```

#### mutations

Object mapping actions to the associated state mutation.

For example, in `Redux` you'd do

```
function todosReducer(state=[],action) {

    switch(action.type) {
        case 'ADD':  return [ ...state, action.payload ];

        case 'DONE': return state.map( todo => todo.id === action.payload 
            ? { ...todo, done: true } : todo )

        default: return state;
    }
}
```

With Updux:

```
const todosUpdux = updux({
    mutations: {
        add: todo => state => [ ...state, todo ],
        done: done_id => u.map( u.if( ({id} => id === done_id), {done: true} ) )
    }
});
```

The signature of the mutations is `(payload,action) => state => newState`.  
It is designed to play well with `Updeep`. This way, instead of doing

```
    mutation: {
        renameTodo: newName => state => { ...state, name: newName }
    }
```

we can do

```
    mutation: {
        renameTodo: newName => u({ name: newName })
    }
```

Also, the special key `*` can be used to match any 
action not explicitly matched by other mutations.

```
const todosUpdux = updux({
    mutations: {
        add: todo => state => [ ...state, todo ],
        done: done_id => u.map( u.if( ({id} => id === done_id), {done: true} ) ),
        '*' (payload,action) => state => {
            console.warn( "unexpected action ", action.type );
            return state;
        },
    }
});
```

#### effects

Plain object defining asynchronous actions and side-effects triggered by actions.
The effects themselves are Redux middleware, expect with the `dispatch` 
property of the first argument augmented with all the available actions.

```
updux({
    effects: {
        fetch: ({dispatch}) => next => async (action) => {
            next(action);

            let result = await fetch(action.payload.url).then( result => result.json() );
            dispatch.fetchSuccess(result);
        }
    }
});
```


## return value

`updux` returns an object with the following properties:

### initial

Default initial state of the reducer. If applicable, merge
the initial states of `config` and `subduxes`, with
`config` having precedence over `subduxes`.

If nothing was given, defaults to an empty object.

### reducer

A Redux reducer generated using the computed initial state and
mutations.

### mutations

Merge of the config and subduxes mutations. If an action trigger
mutations in both the main updux and its subduxes, the subduxes 
mutations will be performed first.

### actions

Action creators for all actions used in the mutations, effects and subdox
of the updox config. 

The action creators have the signature `(payload={},meta={}) => ({type,
payload,meta})` (with the extra sugar that if `meta` or `payload` are not
specified, the key is not present in the produced action).

### middleware

A middleware aggregating all the effects defined in the 
updox and its subduxes. Effects of the updox itself are
done before the subdoxes effects.

### createStore

Same as doing

```
import { createStore, applyMiddleware } from 'redux';

const { initial, reducer, middleware, actions } = updox(...);

const store = createStore( initial, reducer, applyMiddleware(middleware) );

for ( let type in actions ) {
    store.dispatch[type] = (...args) => {
        store.dispatch(actions[type](...args))
    };
}
```

So that later on you can do

```
store.dispatch.addTodo(...);

// still work
store.dispatch( actions.addTodo(...) );
```





# Example

#### battle.js

```
import { updux } from 'updux';

import game from './game';
import log from './log';
import bogeys from './bogeys';

const { createStore } = updux({
    reducers: { game, log, bogeys }
})

export default createStore;
```

#### game.js


```
import { updux } from 'updux';
import _ from 'lodash';
import u from 'updeep';

import { calculateMovement } from 'game/rules';


export default updux({
    initial: { game: "", players: [], turn: 0, },
    mutations: {
        init_game: ({game: { name, players }}) => {name, players},
        play_turn: () => u({ turn: x => x+1 }),
    },
    effects: {
        play_turn: ({getState,dispatch}) => next => action => {

            const bogeys = api.getState().bogeys;

            // only allow the turn to be played if
            // all ships have their orders in
            if( bogeys.any( bogey => ! bogey.orders ) ) return;

            bogeys.forEach( bogey => {
                dispatch.move( calculateMovement(bogey) )
            } );

            next(action); 
        },
    }
});
```


#### log.js


```
import { updux } from 'updux';

export default updux({
    initial: [],
    actions: {
        '*': (payload,action) => state => [ ...state, action ],
    },
});
```

#### bogeys.js

```
import { updux } from 'updux';
import _ from 'lodash';

export default updux({
    initial: [],
    mutations: {
        init_game: ({bogeys}) => () => _.keyBy( bogeys, 'id' ),
        move: ({position}) => u({ position }),
    },
});
```


#### myGame.js

```
import Battle from './battle';

const battle = Battle();

battle.dispatch.init_game({
    name: 'Gemini Prime',
    players: [ 'yenzie' ],
    bogeys: [ { id: 'Enkidu' } ]
});

battle.dispatch.play_game();

....
```


[Redux]: https://redux.js.org
[rematch]: https://rematch.github.io
[Updeep]: https://github.com/substantial/updeep
[VueX]: https://vuex.vuejs.org/
