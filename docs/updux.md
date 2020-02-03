# Updux 

`Updux` is a way to minimize and simplify the boilerplate associated with the
creation of a `Redux` store. It takes a shorthand configuration
object, and generates the appropriate reducer, actions, middleware, etc.
In true `Redux`-like fashion, upduxes can be made of sub-upduxes (`subduxes` for short) for different slices of the root state.

## Constructor

    const updux = new Updux({ ...buildArgs })

### arguments

#### initial 

Default initial state of the reducer. If applicable, is merged with 
the subduxes initial states, with the parent having precedence.

If not provided, defaults to an empty object.

#### actions

Generic action creations are automatically created from the mutations and effects, but you can
also define custom action creator here. The object's values are function that
transform the arguments of the creator to the action's payload.

```js
const { actions } = updux({
    actions: {
        bar: (x,y) => ({x,y})
    },
    mutations: {
        foo: () => state => state,
    }
});

actions.foo({ x: 1, y: 2 }); // => { type: foo, payload: { x:1, y:2  } }
actions.bar(1,2);            // => { type: bar, payload: { x:1, y:2  } }


#### selectors

Dictionary of selectors for the current updux. The updux also
inherit its dubduxes' selectors. 

The selectors are available via the class' getter and, for 
middlewares, the middlewareApi.

```js
const todoUpdux = new Updux({
    selectors: {
        done: state => state.filter( ({done}) => done ),
        byId: state => targetId => state.find( ({id}) => id === targetId ),
    }
}
```

#### mutations

Object mapping actions to the associated state mutation.

For example, in `Redux` you'd do

```js
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

```js
const todosUpdux = updux({
    mutations: {
        add: todo => state => [ ...state, todo ],
        done: done_id => u.map( u.if( ({id} => id === done_id), {done: true} ) )
    }
});
```

The signature of the mutations is `(payload,action) => state => newState`.
It is designed to play well with `Updeep` (and [Immer](https://immerjs.github.io/immer/docs/introduction)). This way, instead of doing

```js
    mutation: {
        renameTodo: newName => state => { ...state, name: newName }
    }
```

we can do

```js
    mutation: {
        renameTodo: newName => u({ name: newName })
    }
```

Also, the special key `*` can be used to match any
action not explicitly matched by other mutations.

```js
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


#### groomMutations 

  
Function that can be provided to alter all local mutations of the updux
(the mutations of subduxes are left untouched).
   
Can be used, for example, for Immer integration:
   
```js
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
   
Or perhaps for debugging:
   
```js
import Updux from 'updux';
   
const updux = new Updux({
    initial: { counter: 0 },
    groomMutations: mutation => (...args) => state => {
        console.log( "got action ", args[1] );
        return mutation(...args)(state);
    }
});
```

#### subduxes

Object mapping slices of the state to sub-upduxes. In addition to creating 
sub-reducers for those slices, it'll make the parend updux inherit all the
actions and middleware from its subduxes.

For example, if in plain Redux you would do

```js
import { combineReducers } from 'redux';
import todosReducer from './todos';
import statisticsReducer from './statistics';

const rootReducer = combineReducers({
    todos: todosReducer,
    stats: statisticsReducer,
});
```

then with Updux you'd do

```js
import { updux } from 'updux';
import todos from './todos';
import statistics from './statistics';

const rootUpdux = updux({
    subduxes: {
        todos, 
        statistics
    }
});
```

#### effects

Plain object defining asynchronous actions and side-effects triggered by actions.
The effects themselves are Redux middleware, with the `dispatch`
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


#### middleware

## Getters

### actions 

Action creators for all actions defined or used in the actions, mutations, effects and subduxes
of the updux config.

Non-custom action creators defined in `actions` have the signature `(payload={},meta={}) => ({type,
payload,meta})` (with the extra sugar that if `meta` or `payload` are not
specified, the key is not present in the produced action).
   
If the same action appears in multiple locations, the precedence order
determining which one will prevail is
   
    actions generated from mutations/effects < non-custom subduxes actions <
    custom subduxes actions < custom actions

### middleware 

    const middleware = updux.middleware;
  
Array of middlewares aggregating all the effects defined in the
updux and its subduxes. Effects of the updux itself are
done before the subduxes effects.
Note that `getState` will always return the state of the
local updux. The function `getRootState` is provided
alongside `getState` to get the root state.
  

#### reducer 

A Redux reducer generated using the computed initial state and
mutations.


#### mutations 

Merge of the updux and subduxes mutations. If an action triggers
mutations in both the main updux and its subduxes, the subduxes
mutations will be performed first.

#### subduxUpreducer 

  
Returns the upreducer made of the merge of all sudbuxes reducers, without
the local mutations. Useful, for example, for sink mutations.

```js
import todo from './todo'; // updux for a single todo
import Updux from 'updux';
import u from 'updeep';
   
const todos = new Updux({ initial: [], subduxes: { '*': todo } });
todos.addMutation(
    todo.actions.done,
    ({todo_id},action) => u.map( u.if( u.is('id',todo_id) ), todos.subduxUpreducer(action) )
    true
);
```


#### createStore 

  
Same as doing
   
```js
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
   
```js
store.dispatch.addTodo(...);
   
// still work
store.dispatch( actions.addTodo(...) );
``` 

## Methods

### asDux 

  
Returns a [ducks](https://github.com/erikras/ducks-modular-redux)-like
plain object holding the reducer from the Updux object and all
its trimmings.
   

### addMutation

Adds a mutation and its associated action to the updux.
If a local mutation was already associated to the action,
it will be replaced by the new one.
@param isSink
If `true`, disables the subduxes mutations for this action. To
conditionally run the subduxes mutations, check out [[subduxUpreducer]].

```js
updux.addMutation( add, inc => state => state + inc );
```

### addAction

```js
const action = updux.addAction( name, ...creatorArgs );
const action = updux.addAction( otherActionCreator );
```

Adds an action to the updux. It can take an already defined action creator,
or any arguments that can be passed to `actionCreator`.

```js
import {actionCreator, Updux} from 'updux';

const updux = new Updux(); 

const foo = updux.addAction('foo');
const bar = updux.addAction( 'bar', (x) => ({stuff: x+1}) );

const baz = actionCreator( 'baz' );

foo({ a: 1});  // => { type: 'foo', payload: { a: 1 } }
bar(2);        // => { type: 'bar', payload: { stuff: 3 } }
baz();         // => { type: 'baz', payload: undefined }

```

### selectors

Returns a dictionary of the 
updux's selectors. Subduxes' selectors 
are included as well (with the mapping to the sub-state already 
taken care of you).


