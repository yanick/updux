"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function buildUpreducer(initial, mutations) {
    return (action) => (state) => {
        if (state === null)
            state = initial;
        const a = mutations[action.type] ||
            mutations['*'];
        if (!a)
            return state;
        return a(action.payload, action)(state);
    };
}
exports.default = buildUpreducer;
//# sourceMappingURL=index.js.map