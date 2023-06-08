/* eslint-disable no-undef */
import { describe } from "node:test";
import { mongoConnect } from "../src/databases/mongo-db";
import mongoose from "mongoose";

// beforeAll -> means before all tests run X
// testing goes here.
// afterAll -> after all tests run y.

describe("User controller", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // test starts with "it"
  // expect true to be truthy -> simple test.
  it("Simple test to check jest in working", () => {
    expect(true).toBeTruthy();
  });

  it("Simple test to check jest in working", () => {
    const miTexto = "Hola chicos";
    expect(miTexto.length).toBe(11);
  });
});
