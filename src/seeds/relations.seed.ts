import mongoose from "mongoose";
import { mongoConnect } from "../databases/mongo-db";
import { Book } from "../models/mongo/Book";
import { Author } from "../models/mongo/Author";
import { generateRandom } from "../utils/generate-random";

const relationSeed = async (): Promise<void> => {
  try {
    await mongoConnect();
    console.log("Tenemos conexión!");

    // Recuperamos libros y autores
    const books = await Book.find();
    const authors = await Author.find();

    // Comprobar que existen libros
    if (!books.length) {
      console.error("No hay libros para relacionar en la base de datos");
      return;
    }

    // Comprobar que existen autores
    if (!authors.length) {
      console.error("No hay autores para relacionar en la base de datos");
      return;
    }

    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const randomAuthor = authors[generateRandom(0, authors.length - 1)];
      book.author = randomAuthor.id;
      await book.save();
    }

    console.log("Relación entre libros-autores creada correctamente.");
  } catch (error) {
  } finally {
    await mongoose.disconnect();
  }
};

void relationSeed();
