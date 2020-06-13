"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updux_1 = __importDefault(require("./updux"));
const foo = new updux_1.default({
    initial: 0,
    mutations: {
        doIt: () => (state) => {
            return state + 1;
        },
        doTheThing: () => (state) => {
            return state + 3;
        },
    },
});
const bar = new updux_1.default({
    subduxes: { foo },
});
bar.addMutation(foo.actions.doTheThing, (_, action) => state => {
    return {
        ...state,
        baz: bar.subduxUpreducer(action)(state),
    };
}, true);
bar.addMutation(foo.actions.doIt, () => (state) => ({ ...state, bar: 'yay' }), true);
test('initial', () => {
    expect(bar.initial).toEqual({ foo: 0 });
});
test('foo alone', () => {
    expect(foo.reducer(undefined, foo.actions.doIt())).toEqual(1);
});
test('sink mutations', () => {
    expect(bar.reducer(undefined, bar.actions.doIt())).toEqual({
        foo: 0,
        bar: 'yay',
    });
});
test('sink mutation and subduxUpreducer', () => {
    expect(bar.reducer(undefined, bar.actions.doTheThing())).toEqual({
        foo: 0,
        baz: { foo: 3 },
    });
});
//# sourceMappingURL=sink.test.js.map