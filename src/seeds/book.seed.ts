import mongoose from "mongoose";
import { mongoConnect } from "../databases/mongo-db";
import { Book } from "../models/mongo/Book";
import { faker } from "@faker-js/faker";

const bookList: any = [];

// Creamos libros adicionales
for (let i = 0; i < 50; i++) {
  const newBook = {
    title: "The " + faker.word.adjective() + " " + faker.word.noun(),
    pages: faker.datatype.number({ max: 3031, min: 1 }),
    publisher: {
      name: faker.company.name(),
      country: faker.address.country(),
    },
  };
  bookList.push(newBook);
}

const bookSeed = async (): Promise<void> => {
  try {
    // Conectar a BBDD
    await mongoConnect();
    console.log("Tenemos conexión");
    // Borrar datos
    await Book.collection.drop();
    console.log("Libros eliminados");
    // Añadir libros
    const documents = bookList.map((book: any) => new Book(book));
    await Book.insertMany(documents);
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};
void bookSeed();
