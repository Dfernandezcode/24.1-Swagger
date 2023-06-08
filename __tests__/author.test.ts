/* eslint-disable @typescript-eslint/no-unused-vars */
// import { describe } from "node:test";
import { mongoConnect } from "../src/databases/mongo-db";
import mongoose from "mongoose";
import { app, server } from "../src/index";
import request from "supertest";
import { Author, type IAuthor } from "../src/models/mongo/Author";

// beforeAll -> means before all tests run X
// testing goes here.
// afterAll -> after all tests run y.

describe("author controller", () => {
  const authorMock: IAuthor = {
    email: "daniel@mail.com",
    password: "123456789",
    name: "Daniel Fernandez",
    country: "Spain",
    profileImage: "image.jpeg",
  };
});

beforeAll(async () => {
  await mongoConnect();
  await Author.collection.drop();
  console.log("Eliminados todos los usuarios"); // deletes users before test.
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

it("Simple test to check jest in working", () => {
  expect(true).toBeTruthy();
});

it("Simple test to check jest in working", () => {
  const miTexto = "Hola chicos";
  expect(miTexto.length).toBe(11);
});

it("POST /author - should create an author", async () => {
  const response = await request(app).post("/author").send(authorMock).set("Accept", "application/json").expect(201);

  expect(response.body).toHaveProperty("_id");
  expect(response.body.email).toBe(authorMock.email);
});
