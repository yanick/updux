
# What's Updux?

So, I'm a fan of [Redux](https://redux.js.org). 

As I was looking into tools to help cut on its boilerplate,
I came across [rematch](https://rematch.github.io/rematch). 
It has a few pretty darn good ideas.
Keeping mutations and asynchronous effects close to the 
reducer definition? Nice. Automatically infering the 
actions from the said mutations and effects? Genius!

But it also enforces a flat hierarchy of reducers -- where
is the fun in that? And I'm also having a strong love for
[Updeep](https://github.com/substantial/updeep), so I want reducer state updates to leverage the heck out of it.

Hence: `Updux`. Heavily inspired by `rematch`, but twisted
to work with `updeep` and to fit my peculiar needs. It offers features such as

* Mimic the way VueX has mutations (reducer reactions to specific actions) and
    effects (middleware reacting to actions that can be asynchronous and/or
    have side-effects), so everything pertaining to a store are all defined
    in the space place.
* Automatically gather all actions used by the updux's effects and mutations,
    and makes then accessible as attributes to the `dispatch` object of the
    store.
* Mutations have a signature that is friendly to Updux and Immer.
* Mutations auto-unwrapping the payload of actions for you.
* TypeScript types.
* Leverage [ts-action](https://www.npmjs.com/package/ts-action) for action
    creation.

**Fair warning**: this package is still very new, likely to go through
big changes before I find the perfect balance between ease of use and sanity.
Caveat Emptor.

# Synopsis

```
import Updux from 'updux';
import { action, payload } from 'ts-action';

import otherDux from './otherUpdux';

const inc = action( 'INC', payload<int>() );

const updux = new Updux({
    initial: {
        counter: 0,
    },
    actions: {
        inc 
    },
    subduxes: {
        otherDux,
    }
});

updux.addMutation( inc, increment => u({counter: s => s + increment }));

updux.addEffect( '*', api => next => action => {
    console.log( "hey, look, an action zoomed by!", action );
    next(action);
} );

const myDux = updux.asDux;

const store = myDux.createStore();

store.dispatch( myDux.actions.inc(3) );
```

# Description

The formal documentation of the class Updux and its associated functions and
types can be found over [here](https://yanick.github.io/updux/docs/classes/updux.html).

## Exporting upduxes

If you are creating upduxes that will be used as subduxes
by other upduxes, or as
[ducks](https://github.com/erikras/ducks-modular-redux)-like containers, I
recommend that you export the "compiled" (as in, no more editable and with all its properties resolved) output of the Updux instance via its `asDux()` getter:

```
import Updux from 'updux';

const updux = new Updux({ ... });

export default updux.asDux;
```

Then you can use them as subduxes like this:

```
import Updux from 'updux';
import foo from './foo'; // foo is a dux
import bar from './bar'; // bar is a dux as well

const updux = new Updux({
    subduxes: {
        foo, bar
    }
});
```
