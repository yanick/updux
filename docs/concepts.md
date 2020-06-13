# Updux concepts

## actions

Updux internally uses the package `ts-action` to create action creator
functions. Even if you don't use Typescript, I recommend that you use it,
as it does what it does very well. But if you don't want to, no big deal.
Updux will recognize a function as an action creator if it has a `type`
property. So a homegrown creator could be as simple as:

```js
function action(type) {
    return Object.assign( payload => ({type, payload}), { type } )
}
```

## effects

Updux effects are redux middlewares. I kept that format, and the
use of `next` mostly because I wanted to give myself a way to alter 
actions before they hit the reducer, something that `redux-saga` and 
`rematch` don't allow.

An effect has the signature

```js
const effect = ({ getState, dispatch }) => next => action => { ... }
```
