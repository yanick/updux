
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

## Example

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
