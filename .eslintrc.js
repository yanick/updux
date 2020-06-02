// @format

// https://dev.to/robertcoopercode/using-eslint-and-prettier-in-a-typescript-project-53jb

const _ = require('lodash');

const ts_nope = [
    'no-explicit-any',
    'explicit-function-return-type',
    'no-object-literal-type-assertion',
    'camelcase',
    'member-delimiter-style',
    'prefer-interface',
    'indent',
].map(r => '@typescript-eslint/' + r);

module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    plugins: ['import'],
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    rules: {
        ..._.fromPairs(ts_nope.map(r => [r, 'off'])),
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    },
};
