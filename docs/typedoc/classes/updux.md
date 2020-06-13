[updux - v1.2.0](../README.md) › [Globals](../globals.md) › [Updux](updux.md)

# Class: Updux <**S, A, X, C**>

## Type parameters

▪ **S**

▪ **A**

▪ **X**

▪ **C**: *[UpduxConfig](../globals.md#upduxconfig)*

## Hierarchy

* **Updux**

## Index

### Constructors

* [constructor](updux.md#constructor)

### Properties

* [coduxes](updux.md#coduxes)
* [groomMutations](updux.md#groommutations)
* [subduxes](updux.md#subduxes)

### Accessors

* [_middlewareEntries](updux.md#_middlewareentries)
* [actions](updux.md#actions)
* [asDux](updux.md#asdux)
* [createStore](updux.md#createstore)
* [initial](updux.md#initial)
* [middleware](updux.md#middleware)
* [mutations](updux.md#mutations)
* [reducer](updux.md#reducer)
* [selectors](updux.md#selectors)
* [subduxUpreducer](updux.md#subduxupreducer)
* [upreducer](updux.md#upreducer)

### Methods

* [addAction](updux.md#addaction)
* [addEffect](updux.md#addeffect)
* [addMutation](updux.md#addmutation)
* [addSelector](updux.md#addselector)

## Constructors

###  constructor

\+ **new Updux**(`config`: C): *[Updux](updux.md)*

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`config` | C | {} as C | an [UpduxConfig](../globals.md#upduxconfig) plain object   |

**Returns:** *[Updux](updux.md)*

## Properties

###  coduxes

• **coduxes**: *[Dux](../globals.md#dux)[]*

___

###  groomMutations

• **groomMutations**: *function*

#### Type declaration:

▸ (`mutation`: [Mutation](../globals.md#mutation)‹S›): *[Mutation](../globals.md#mutation)‹S›*

**Parameters:**

Name | Type |
------ | ------ |
`mutation` | [Mutation](../globals.md#mutation)‹S› |

___

###  subduxes

• **subduxes**: *[Dictionary](../globals.md#dictionary)‹[Dux](../globals.md#dux)›*

## Accessors

###  _middlewareEntries

• **get _middlewareEntries**(): *any[]*

**Returns:** *any[]*

___

###  actions

• **get actions**(): *[DuxActions](../globals.md#duxactions)‹A, C›*

Action creators for all actions defined or used in the actions, mutations, effects and subduxes
of the updux config.

Non-custom action creators defined in `actions` have the signature `(payload={},meta={}) => ({type,
payload,meta})` (with the extra sugar that if `meta` or `payload` are not
specified, that key won't be present in the produced action).

The same action creator can be included
in multiple subduxes. However, if two different creators
are included for the same action, an error will be thrown.

**`example`** 

```
const actions = updux.actions;
```

**Returns:** *[DuxActions](../globals.md#duxactions)‹A, C›*

___

###  asDux

• **get asDux**(): *object*

Returns a <a href="https://github.com/erikras/ducks-modular-redux">ducks</a>-like
plain object holding the reducer from the Updux object and all
its trimmings.

**`example`** 

```
const {
    createStore,
    upreducer,
    subduxes,
    coduxes,
    middleware,
    actions,
    reducer,
    mutations,
    initial,
    selectors,
} = myUpdux.asDux;
```

**Returns:** *object*

* **actions**: = this.actions

* **coduxes**: *object[]* = this.coduxes

* **createStore**(): *function*

  * (`initial?`: S, `injectEnhancer?`: Function): *Store‹S› & object*

* **initial**: = this.initial

* **middleware**(): *function*

  * (`api`: UpduxMiddlewareAPI‹S, X›): *function*

    * (`next`: Function): *function*

      * (`action`: A): *any*

* **mutations**(): *object*

* **reducer**(): *function*

  * (`state`: S | undefined, `action`: [Action](../globals.md#action)): *S*

* **selectors**: = this.selectors

* **subduxes**(): *object*

* **upreducer**(): *function*

  * (`action`: [Action](../globals.md#action)): *function*

    * (`state`: S): *S*

___

###  createStore

• **get createStore**(): *function*

Returns a `createStore` function that takes two argument:
`initial` and `injectEnhancer`. `initial` is a custom
initial state for the store, and `injectEnhancer` is a function
taking in the middleware built by the updux object and allowing
you to wrap it in any enhancer you want.

**`example`** 

```
const createStore = updux.createStore;

const store = createStore(initial);
```

**Returns:** *function*

▸ (`initial?`: S, `injectEnhancer?`: Function): *Store‹S› & object*

**Parameters:**

Name | Type |
------ | ------ |
`initial?` | S |
`injectEnhancer?` | Function |

___

###  initial

• **get initial**(): *AggDuxState‹S, C›*

**Returns:** *AggDuxState‹S, C›*

___

###  middleware

• **get middleware**(): *[UpduxMiddleware](../globals.md#upduxmiddleware)‹AggDuxState‹S, C›, [DuxSelectors](../globals.md#duxselectors)‹AggDuxState‹S, C›, X, C››*

Array of middlewares aggregating all the effects defined in the
updux and its subduxes. Effects of the updux itself are
done before the subduxes effects.
Note that `getState` will always return the state of the
local updux.

**`example`** 

```
const middleware = updux.middleware;
```

**Returns:** *[UpduxMiddleware](../globals.md#upduxmiddleware)‹AggDuxState‹S, C›, [DuxSelectors](../globals.md#duxselectors)‹AggDuxState‹S, C›, X, C››*

___

###  mutations

• **get mutations**(): *[Dictionary](../globals.md#dictionary)‹[Mutation](../globals.md#mutation)‹S››*

Merge of the updux and subduxes mutations. If an action triggers
mutations in both the main updux and its subduxes, the subduxes
mutations will be performed first.

**Returns:** *[Dictionary](../globals.md#dictionary)‹[Mutation](../globals.md#mutation)‹S››*

___

###  reducer

• **get reducer**(): *function*

A Redux reducer generated using the computed initial state and
mutations.

**Returns:** *function*

▸ (`state`: S | undefined, `action`: [Action](../globals.md#action)): *S*

**Parameters:**

Name | Type |
------ | ------ |
`state` | S &#124; undefined |
`action` | [Action](../globals.md#action) |

___

###  selectors

• **get selectors**(): *[DuxSelectors](../globals.md#duxselectors)‹AggDuxState‹S, C›, X, C›*

A dictionary of the updux's selectors. Subduxes'
selectors are included as well (with the mapping to the
sub-state already taken care of you).

**Returns:** *[DuxSelectors](../globals.md#duxselectors)‹AggDuxState‹S, C›, X, C›*

___

###  subduxUpreducer

• **get subduxUpreducer**(): *function*

Returns the upreducer made of the merge of all sudbuxes reducers, without
the local mutations. Useful, for example, for sink mutations.

**`example`** 

```
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

**Returns:** *function*

▸ (`action`: [Action](../globals.md#action)): *function*

**Parameters:**

Name | Type |
------ | ------ |
`action` | [Action](../globals.md#action) |

▸ (`state`: S): *S*

**Parameters:**

Name | Type |
------ | ------ |
`state` | S |

___

###  upreducer

• **get upreducer**(): *[Upreducer](../globals.md#upreducer)‹S›*

**Returns:** *[Upreducer](../globals.md#upreducer)‹S›*

## Methods

###  addAction

▸ **addAction**(`theaction`: string, `transform?`: any): *ActionCreator‹string, any›*

Adds an action to the updux. It can take an already defined action
creator, or any arguments that can be passed to `actionCreator`.

**`example`** 
```
    const action = updux.addAction( name, ...creatorArgs );
    const action = updux.addAction( otherActionCreator );
```

**`example`** 
```
import {actionCreator, Updux} from 'updux';

const updux = new Updux();

const foo = updux.addAction('foo');
const bar = updux.addAction( 'bar', (x) => ({stuff: x+1}) );

const baz = actionCreator( 'baz' );

foo({ a: 1});  // => { type: 'foo', payload: { a: 1 } }
bar(2);        // => { type: 'bar', payload: { stuff: 3 } }
baz();         // => { type: 'baz', payload: undefined }
```

**Parameters:**

Name | Type |
------ | ------ |
`theaction` | string |
`transform?` | any |

**Returns:** *ActionCreator‹string, any›*

▸ **addAction**(`theaction`: string | ActionCreator‹any›, `transform?`: undefined): *ActionCreator‹string, any›*

**Parameters:**

Name | Type |
------ | ------ |
`theaction` | string &#124; ActionCreator‹any› |
`transform?` | undefined |

**Returns:** *ActionCreator‹string, any›*

___

###  addEffect

▸ **addEffect**<**AC**>(`creator`: AC, `middleware`: [UpduxMiddleware](../globals.md#upduxmiddleware)‹AggDuxState‹S, C›, [DuxSelectors](../globals.md#duxselectors)‹AggDuxState‹S, C›, X, C›, ReturnType‹AC››, `isGenerator?`: undefined | false | true): *any*

**Type parameters:**

▪ **AC**: *ActionCreator*

**Parameters:**

Name | Type |
------ | ------ |
`creator` | AC |
`middleware` | [UpduxMiddleware](../globals.md#upduxmiddleware)‹AggDuxState‹S, C›, [DuxSelectors](../globals.md#duxselectors)‹AggDuxState‹S, C›, X, C›, ReturnType‹AC›› |
`isGenerator?` | undefined &#124; false &#124; true |

**Returns:** *any*

▸ **addEffect**(`creator`: string, `middleware`: [UpduxMiddleware](../globals.md#upduxmiddleware)‹AggDuxState‹S, C›, [DuxSelectors](../globals.md#duxselectors)‹AggDuxState‹S, C›, X, C››, `isGenerator?`: undefined | false | true): *any*

**Parameters:**

Name | Type |
------ | ------ |
`creator` | string |
`middleware` | [UpduxMiddleware](../globals.md#upduxmiddleware)‹AggDuxState‹S, C›, [DuxSelectors](../globals.md#duxselectors)‹AggDuxState‹S, C›, X, C›› |
`isGenerator?` | undefined &#124; false &#124; true |

**Returns:** *any*

___

###  addMutation

▸ **addMutation**<**A**>(`creator`: A, `mutation`: [Mutation](../globals.md#mutation)‹S, ActionType‹A››, `isSink?`: undefined | false | true): *any*

Adds a mutation and its associated action to the updux.

**`remarks`** 

If a local mutation was already associated to the action,
it will be replaced by the new one.

**`example`** 

```js
updux.addMutation(
    action('ADD', payload<int>() ),
    inc => state => state + in
);
```

**Type parameters:**

▪ **A**: *ActionCreator*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`creator` | A | - |
`mutation` | [Mutation](../globals.md#mutation)‹S, ActionType‹A›› | - |
`isSink?` | undefined &#124; false &#124; true | If `true`, disables the subduxes mutations for this action. To conditionally run the subduxes mutations, check out [subduxUpreducer](updux.md#subduxupreducer). Defaults to `false`.  |

**Returns:** *any*

▸ **addMutation**<**A**>(`creator`: string, `mutation`: [Mutation](../globals.md#mutation)‹S, any›, `isSink?`: undefined | false | true): *any*

**Type parameters:**

▪ **A**: *ActionCreator*

**Parameters:**

Name | Type |
------ | ------ |
`creator` | string |
`mutation` | [Mutation](../globals.md#mutation)‹S, any› |
`isSink?` | undefined &#124; false &#124; true |

**Returns:** *any*

___

###  addSelector

▸ **addSelector**(`name`: string, `selector`: [Selector](../globals.md#selector)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`selector` | [Selector](../globals.md#selector) |

**Returns:** *void*
