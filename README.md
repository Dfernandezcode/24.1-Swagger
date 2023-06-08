# node-simple-template

API for different items.

TESTING

---

use:

npm i jest npm i @types/jest npm i supertest npm i @types/supertest npm i ts-jest

Change package.json:

    "test": "echo \"Error: no test specified\" && exit 1",
    =>
    "test":"jest"

    ------------------------------------------------------

It is recommended to create a folder:

    "__test__"

to be used for all JS testing.

don't forget to include it in the tsconfig.json:

    "include": ["src/**/*.ts", "__tests__/**/*.ts", "__tests__/*.ts"],

To create a test file:

    example: user.test.js

run: "npx ts-jest config:init" in terminal to create: "jest.config.js"

then: "npm i --save-dev@types/jest"

=--------------------------------

Error:

Details:

    C:\Users\dfern\Documents\The Valley\24.1-Swagger\__tests__\user.test.js:2
    import { describe } from "node:test";
    ^^^^^^

    SyntaxError: Cannot use import statement outside a module

      at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1495:14)

Tests: 0 total Snapshots: 0 total Time: 0.429 s Ran all test suites.

.env Installs for userTokens.

    npm install --save-dev cross-env
