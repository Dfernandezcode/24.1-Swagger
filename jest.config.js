/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // testMatch used so that jest runs only tests in the root folder of "__tests__"
  testMatch: ["**/__tests__/**/*.ts"],
};
