"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updux_1 = __importDefault(require("./updux"));
const updeep_1 = __importDefault(require("updeep"));
const todo = new updux_1.default({
    mutations: {
        review: () => updeep_1.default({ reviewed: true }),
        done: () => updeep_1.default({ done: true }),
    },
});
const todos = new updux_1.default({
    subduxes: { '*': todo },
});
todos.addMutation(todo.actions.done, (id, action) => updeep_1.default.map(updeep_1.default.if(updeep_1.default.is('id', id), todo.upreducer(action))), true);
test('* for mapping works', () => {
    const reducer = todos.reducer;
    let state = [{ id: 0 }, { id: 1 }];
    state = reducer(state, todos.actions.review());
    state = reducer(state, todos.actions.done(1));
    expect(state).toEqual([
        { id: 0, reviewed: true },
        { id: 1, reviewed: true, done: true },
    ]);
});
//# sourceMappingURL=mappedUpdux.test.js.map