"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const updux_1 = __importStar(require("./updux"));
test('added mutation is present', () => {
    const updux = new updux_1.default({
        initial: { sum: 0 },
    });
    const add = updux_1.actionCreator('add', (n) => ({ n }));
    updux.addMutation(add, ({ n }, action) => ({ sum }) => ({ sum: sum + n }));
    updux.mutations;
    const store = updux.createStore();
    store.dispatch.add(3);
    expect(store.getState()).toEqual({ sum: 3 });
});
//# sourceMappingURL=addMutations.test.js.map