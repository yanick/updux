[updux - v1.2.0](README.md) › [Globals](globals.md)

# updux - v1.2.0

## Index

### Classes

* [Updux](classes/updux.md)

### Type aliases

* [Action](globals.md#action)
* [ActionPair](globals.md#actionpair)
* [ActionPayloadGenerator](globals.md#actionpayloadgenerator)
* [ActionsOf](globals.md#actionsof)
* [CoduxesOf](globals.md#coduxesof)
* [Dictionary](globals.md#dictionary)
* [Dux](globals.md#dux)
* [DuxActions](globals.md#duxactions)
* [DuxActionsCoduxes](globals.md#duxactionscoduxes)
* [DuxActionsSubduxes](globals.md#duxactionssubduxes)
* [DuxSelectors](globals.md#duxselectors)
* [DuxState](globals.md#duxstate)
* [DuxStateCoduxes](globals.md#duxstatecoduxes)
* [DuxStateGlobSub](globals.md#duxstateglobsub)
* [DuxStateSubduxes](globals.md#duxstatesubduxes)
* [Effect](globals.md#effect)
* [GenericActions](globals.md#genericactions)
* [ItemsOf](globals.md#itemsof)
* [LocalDuxState](globals.md#localduxstate)
* [MaybePayload](globals.md#maybepayload)
* [MaybeReturnType](globals.md#maybereturntype)
* [Merge](globals.md#merge)
* [Mutation](globals.md#mutation)
* [MutationEntry](globals.md#mutationentry)
* [MwGen](globals.md#mwgen)
* [Next](globals.md#next)
* [RebaseSelector](globals.md#rebaseselector)
* [Selector](globals.md#selector)
* [SelectorsOf](globals.md#selectorsof)
* [StateOf](globals.md#stateof)
* [StoreWithDispatchActions](globals.md#storewithdispatchactions)
* [SubMutations](globals.md#submutations)
* [Submws](globals.md#submws)
* [UnionToIntersection](globals.md#uniontointersection)
* [UpduxActions](globals.md#upduxactions)
* [UpduxConfig](globals.md#upduxconfig)
* [UpduxLocalActions](globals.md#upduxlocalactions)
* [UpduxMiddleware](globals.md#upduxmiddleware)
* [Upreducer](globals.md#upreducer)

### Variables

* [subEffects](globals.md#const-subeffects)
* [updux](globals.md#const-updux)

### Functions

* [MiddlewareFor](globals.md#const-middlewarefor)
* [buildActions](globals.md#buildactions)
* [buildCreateStore](globals.md#buildcreatestore)
* [buildInitial](globals.md#buildinitial)
* [buildMiddleware](globals.md#buildmiddleware)
* [buildMutations](globals.md#buildmutations)
* [buildSelectors](globals.md#buildselectors)
* [buildUpreducer](globals.md#buildupreducer)
* [coduxes](globals.md#const-coduxes)
* [composeMutations](globals.md#const-composemutations)
* [composeMw](globals.md#const-composemw)
* [dux](globals.md#const-dux)
* [effectToMw](globals.md#const-effecttomw)
* [sliceMw](globals.md#slicemw)
* [subMiddleware](globals.md#const-submiddleware)
* [subSelectors](globals.md#subselectors)

## Type aliases

###  Action

Ƭ **Action**: *object & [MaybePayload](globals.md#maybepayload)‹P›*

___

###  ActionPair

Ƭ **ActionPair**: *[string, ActionCreator]*

___

###  ActionPayloadGenerator

Ƭ **ActionPayloadGenerator**: *function*

#### Type declaration:

▸ (...`args`: any[]): *any*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

___

###  ActionsOf

Ƭ **ActionsOf**: *U extends Updux ? U["actions"] : object*

___

###  CoduxesOf

Ƭ **CoduxesOf**: *U extends Updux<any, any, any, infer S> ? S : []*

___

###  Dictionary

Ƭ **Dictionary**: *object*

#### Type declaration:

* \[ **key**: *string*\]: T

___

###  Dux

Ƭ **Dux**: *object*

#### Type declaration:

* **actions**: *A*

* **coduxes**: *[Dux](globals.md#dux)[]*

* **initial**: *AggDuxState‹S, C›*

* **subduxes**: *[Dictionary](globals.md#dictionary)‹[Dux](globals.md#dux)›*

___

###  DuxActions

Ƭ **DuxActions**:

___

###  DuxActionsCoduxes

Ƭ **DuxActionsCoduxes**: *C extends Array<infer I> ? UnionToIntersection<ActionsOf<I>> : object*

___

###  DuxActionsSubduxes

Ƭ **DuxActionsSubduxes**: *C extends object ? ActionsOf<C[keyof C]> : unknown*

___

###  DuxSelectors

Ƭ **DuxSelectors**: *unknown extends X ? object : X*

___

###  DuxState

Ƭ **DuxState**: *D extends object ? S : unknown*

___

###  DuxStateCoduxes

Ƭ **DuxStateCoduxes**: *C extends Array<infer U> ? UnionToIntersection<StateOf<U>> : unknown*

___

###  DuxStateGlobSub

Ƭ **DuxStateGlobSub**: *S extends object ? StateOf<I> : unknown*

___

###  DuxStateSubduxes

Ƭ **DuxStateSubduxes**: *C extends object ? object : C extends object ? object : unknown*

___

###  Effect

Ƭ **Effect**: *[string, [UpduxMiddleware](globals.md#upduxmiddleware) | [MwGen](globals.md#mwgen), undefined | false | true]*

___

###  GenericActions

Ƭ **GenericActions**: *[Dictionary](globals.md#dictionary)‹ActionCreator‹string, function››*

___

###  ItemsOf

Ƭ **ItemsOf**: *C extends object ? C[keyof C] : unknown*

___

###  LocalDuxState

Ƭ **LocalDuxState**: *S extends never[] ? unknown[] : S*

___

###  MaybePayload

Ƭ **MaybePayload**: *P extends object | string | boolean | number ? object : object*

___

###  MaybeReturnType

Ƭ **MaybeReturnType**: *X extends function ? ReturnType<X> : unknown*

___

###  Merge

Ƭ **Merge**: *[UnionToIntersection](globals.md#uniontointersection)‹T[keyof T]›*

___

###  Mutation

Ƭ **Mutation**: *function*

#### Type declaration:

▸ (`payload`: A["payload"], `action`: A): *function*

**Parameters:**

Name | Type |
------ | ------ |
`payload` | A["payload"] |
`action` | A |

▸ (`state`: S): *S*

**Parameters:**

Name | Type |
------ | ------ |
`state` | S |

___

###  MutationEntry

Ƭ **MutationEntry**: *[ActionCreator | string, [Mutation](globals.md#mutation)‹any, [Action](globals.md#action)‹string, any››, undefined | false | true]*

___

###  MwGen

Ƭ **MwGen**: *function*

#### Type declaration:

▸ (): *[UpduxMiddleware](globals.md#upduxmiddleware)*

___

###  Next

Ƭ **Next**: *function*

#### Type declaration:

▸ (`action`: [Action](globals.md#action)): *any*

**Parameters:**

Name | Type |
------ | ------ |
`action` | [Action](globals.md#action) |

___

###  RebaseSelector

Ƭ **RebaseSelector**: *object*

#### Type declaration:

___

###  Selector

Ƭ **Selector**: *function*

#### Type declaration:

▸ (`state`: S): *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`state` | S |

___

###  SelectorsOf

Ƭ **SelectorsOf**: *C extends object ? S : unknown*

___

###  StateOf

Ƭ **StateOf**: *D extends object ? I : unknown*

___

###  StoreWithDispatchActions

Ƭ **StoreWithDispatchActions**: *Store‹S› & object*

___

###  SubMutations

Ƭ **SubMutations**: *object*

#### Type declaration:

* \[ **slice**: *string*\]: [Dictionary](globals.md#dictionary)‹[Mutation](globals.md#mutation)›

___

###  Submws

Ƭ **Submws**: *[Dictionary](globals.md#dictionary)‹[UpduxMiddleware](globals.md#upduxmiddleware)›*

___

###  UnionToIntersection

Ƭ **UnionToIntersection**: *U extends any ? function : never extends function ? I : never*

___

###  UpduxActions

Ƭ **UpduxActions**: *U extends Updux ? UnionToIntersection<UpduxLocalActions<U> | ActionsOf<CoduxesOf<U>[keyof CoduxesOf<U>]>> : object*

___

###  UpduxConfig

Ƭ **UpduxConfig**: *Partial‹object›*

Configuration object given to Updux's constructor.

#### arguments

##### initial

Default initial state of the reducer. If applicable, is merged with
the subduxes initial states, with the parent having precedence.

If not provided, defaults to an empty object.

##### actions

[Actions](/concepts/Actions) used by the updux.

```js
import { dux } from 'updux';
import { action, payload } from 'ts-action';

const bar = action('BAR', payload<int>());
const foo = action('FOO');

const myDux = dux({
    actions: {
        bar
    },
    mutations: [
        [ foo, () => state => state ]
    ]
});

myDux.actions.foo({ x: 1, y: 2 }); // => { type: foo, x:1, y:2 }
myDux.actions.bar(2);              // => { type: bar, payload: 2 }
```

New actions used directly in mutations and effects will be added to the
dux actions -- that is, they will be accessible via `dux.actions` -- but will
not appear as part of its Typescript type.

##### selectors

Dictionary of selectors for the current updux. The updux also
inherit its subduxes' selectors.

The selectors are available via the class' getter.

##### mutations

    mutations: [
        [ action, mutation, isSink ],
        ...
    ]

or

    mutations: {
        action: mutation,
        ...
    }

List of mutations for assign to the dux. If you want Typescript goodness, you
probably want to use `addMutation()` instead.

In its generic array-of-array form,
each mutation tuple contains: the action, the mutation,
and boolean indicating if this is a sink mutation.

The action can be an action creator function or a string. If it's a string, it's considered to be the
action type and a generic `action( actionName, payload() )` creator will be
generated for it. If an action is not already defined in the `actions`
parameter, it'll be automatically added.

The pseudo-action type `*` can be used to match any action not explicitly matched by other mutations.

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

The final argument is the optional boolean `isSink`. If it is true, it'll
prevent subduxes' mutations on the same action. It defaults to `false`.

The object version of the argument can be used as a shortcut when all actions
are strings. In that case, `isSink` is `false` for all mutations.

##### groomMutations

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
##### subduxes

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

##### effects

Array of arrays or plain object defining asynchronous actions and side-effects triggered by actions.
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

**`example`** 

```
import Updux from 'updux';
import { actions, payload } from 'ts-action';
import u from 'updeep';

const todoUpdux = new Updux({
    initial: {
        done: false,
        note: "",
    },
    actions: {
        finish: action('FINISH', payload()),
        edit: action('EDIT', payload()),
    },
    mutations: [
        [ edit, note => u({note}) ]
    ],
    selectors: {
        getNote: state => state.note
    },
    groomMutations: mutation => transform(mutation),
    subduxes: {
        foo
    },
    effects: {
        finish: () => next => action => {
            console.log( "Woo! one more bites the dust" );
        }
    }
})
```

___

###  UpduxLocalActions

Ƭ **UpduxLocalActions**: *S extends Updux<any, null> ? object : S extends Updux<any, infer A> ? A : object*

___

###  UpduxMiddleware

Ƭ **UpduxMiddleware**: *function*

#### Type declaration:

▸ (`api`: UpduxMiddlewareAPI‹S, X›): *function*

**Parameters:**

Name | Type |
------ | ------ |
`api` | UpduxMiddlewareAPI‹S, X› |

▸ (`next`: Function): *function*

**Parameters:**

Name | Type |
------ | ------ |
`next` | Function |

▸ (`action`: A): *any*

**Parameters:**

Name | Type |
------ | ------ |
`action` | A |

___

###  Upreducer

Ƭ **Upreducer**: *function*

#### Type declaration:

▸ (`action`: [Action](globals.md#action)): *function*

**Parameters:**

Name | Type |
------ | ------ |
`action` | [Action](globals.md#action) |

▸ (`state`: S): *S*

**Parameters:**

Name | Type |
------ | ------ |
`state` | S |

## Variables

### `Const` subEffects

• **subEffects**: *[Effect](globals.md#effect)* = [ '*', subMiddleware ] as any

___

### `Const` updux

• **updux**: *[Updux](classes/updux.md)‹unknown, null, unknown, object›* = new Updux({
    subduxes: {
        foo: dux({ initial: "banana" })
    }
})

## Functions

### `Const` MiddlewareFor

▸ **MiddlewareFor**(`type`: any, `mw`: Middleware): *Middleware*

**Parameters:**

Name | Type |
------ | ------ |
`type` | any |
`mw` | Middleware |

**Returns:** *Middleware*

___

###  buildActions

▸ **buildActions**(`actions`: [ActionPair](globals.md#actionpair)[]): *[Dictionary](globals.md#dictionary)‹ActionCreator‹string, function››*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`actions` | [ActionPair](globals.md#actionpair)[] | [] |

**Returns:** *[Dictionary](globals.md#dictionary)‹ActionCreator‹string, function››*

___

###  buildCreateStore

▸ **buildCreateStore**<**S**, **A**>(`reducer`: Reducer‹S›, `middleware`: Middleware, `actions`: A): *function*

**Type parameters:**

▪ **S**

▪ **A**

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`reducer` | Reducer‹S› | - |
`middleware` | Middleware | - |
`actions` | A | {} as A |

**Returns:** *function*

▸ (`initial?`: S, `injectEnhancer?`: Function): *Store‹S› & object*

**Parameters:**

Name | Type |
------ | ------ |
`initial?` | S |
`injectEnhancer?` | Function |

___

###  buildInitial

▸ **buildInitial**(`initial`: any, `coduxes`: any, `subduxes`: any): *any*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`initial` | any | - |
`coduxes` | any | [] |
`subduxes` | any | {} |

**Returns:** *any*

___

###  buildMiddleware

▸ **buildMiddleware**<**S**>(`local`: [UpduxMiddleware](globals.md#upduxmiddleware)[], `co`: [UpduxMiddleware](globals.md#upduxmiddleware)[], `sub`: [Submws](globals.md#submws)): *[UpduxMiddleware](globals.md#upduxmiddleware)‹S›*

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`local` | [UpduxMiddleware](globals.md#upduxmiddleware)[] | [] |
`co` | [UpduxMiddleware](globals.md#upduxmiddleware)[] | [] |
`sub` | [Submws](globals.md#submws) | {} |

**Returns:** *[UpduxMiddleware](globals.md#upduxmiddleware)‹S›*

___

###  buildMutations

▸ **buildMutations**(`mutations`: [Dictionary](globals.md#dictionary)‹[Mutation](globals.md#mutation) | [[Mutation](globals.md#mutation), boolean | undefined]›, `subduxes`: object, `coduxes`: [Upreducer](globals.md#upreducer)[]): *object*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`mutations` | [Dictionary](globals.md#dictionary)‹[Mutation](globals.md#mutation) &#124; [[Mutation](globals.md#mutation), boolean &#124; undefined]› | {} |
`subduxes` | object | {} |
`coduxes` | [Upreducer](globals.md#upreducer)[] | [] |

**Returns:** *object*

___

###  buildSelectors

▸ **buildSelectors**(`localSelectors`: [Dictionary](globals.md#dictionary)‹[Selector](globals.md#selector)›, `coduxes`: [Dictionary](globals.md#dictionary)‹[Selector](globals.md#selector)›[], `subduxes`: [Dictionary](globals.md#dictionary)‹[Selector](globals.md#selector)›): *object*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`localSelectors` | [Dictionary](globals.md#dictionary)‹[Selector](globals.md#selector)› | {} |
`coduxes` | [Dictionary](globals.md#dictionary)‹[Selector](globals.md#selector)›[] | [] |
`subduxes` | [Dictionary](globals.md#dictionary)‹[Selector](globals.md#selector)› | {} |

**Returns:** *object*

___

###  buildUpreducer

▸ **buildUpreducer**<**S**>(`initial`: S, `mutations`: [Dictionary](globals.md#dictionary)‹[Mutation](globals.md#mutation)‹S››): *[Upreducer](globals.md#upreducer)‹S›*

**Type parameters:**

▪ **S**

**Parameters:**

Name | Type |
------ | ------ |
`initial` | S |
`mutations` | [Dictionary](globals.md#dictionary)‹[Mutation](globals.md#mutation)‹S›› |

**Returns:** *[Upreducer](globals.md#upreducer)‹S›*

___

### `Const` coduxes

▸ **coduxes**<**C**, **U**>(...`coduxes`: U): *object*

**Type parameters:**

▪ **C**: *[Dux](globals.md#dux)*

▪ **U**: *[C]*

**Parameters:**

Name | Type |
------ | ------ |
`...coduxes` | U |

**Returns:** *object*

* **coduxes**: *U*

___

### `Const` composeMutations

▸ **composeMutations**(`mutations`: [Mutation](globals.md#mutation)[]): *function | (Anonymous function)*

**Parameters:**

Name | Type |
------ | ------ |
`mutations` | [Mutation](globals.md#mutation)[] |

**Returns:** *function | (Anonymous function)*

___

### `Const` composeMw

▸ **composeMw**(`mws`: [UpduxMiddleware](globals.md#upduxmiddleware)[]): *(Anonymous function)*

**Parameters:**

Name | Type |
------ | ------ |
`mws` | [UpduxMiddleware](globals.md#upduxmiddleware)[] |

**Returns:** *(Anonymous function)*

___

### `Const` dux

▸ **dux**<**S**, **A**, **X**, **C**>(`config`: C): *object*

**Type parameters:**

▪ **S**

▪ **A**

▪ **X**

▪ **C**: *[UpduxConfig](globals.md#upduxconfig)*

**Parameters:**

Name | Type |
------ | ------ |
`config` | C |

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

  * (`state`: S | undefined, `action`: [Action](globals.md#action)): *S*

* **selectors**: = this.selectors

* **subduxes**(): *object*

* **upreducer**(): *function*

  * (`action`: [Action](globals.md#action)): *function*

    * (`state`: S): *S*

___

### `Const` effectToMw

▸ **effectToMw**(`effect`: [Effect](globals.md#effect), `actions`: [Dictionary](globals.md#dictionary)‹ActionCreator›, `selectors`: [Dictionary](globals.md#dictionary)‹[Selector](globals.md#selector)›): *subMiddleware | augmented*

**Parameters:**

Name | Type |
------ | ------ |
`effect` | [Effect](globals.md#effect) |
`actions` | [Dictionary](globals.md#dictionary)‹ActionCreator› |
`selectors` | [Dictionary](globals.md#dictionary)‹[Selector](globals.md#selector)› |

**Returns:** *subMiddleware | augmented*

___

###  sliceMw

▸ **sliceMw**(`slice`: string, `mw`: [UpduxMiddleware](globals.md#upduxmiddleware)): *[UpduxMiddleware](globals.md#upduxmiddleware)*

**Parameters:**

Name | Type |
------ | ------ |
`slice` | string |
`mw` | [UpduxMiddleware](globals.md#upduxmiddleware) |

**Returns:** *[UpduxMiddleware](globals.md#upduxmiddleware)*

___

### `Const` subMiddleware

▸ **subMiddleware**(): *(Anonymous function)*

**Returns:** *(Anonymous function)*

___

###  subSelectors

▸ **subSelectors**(`__namedParameters`: [string, Function]): *[string, [Selector](globals.md#selector)][]*

**Parameters:**

Name | Type |
------ | ------ |
`__namedParameters` | [string, Function] |

**Returns:** *[string, [Selector](globals.md#selector)][]*
