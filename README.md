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
