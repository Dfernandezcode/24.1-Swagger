import mongoose from "mongoose";
import { mongoConnect } from "../databases/mongo-db";
import { Book } from "../models/mongo/Book";

const bookNormalization = async (): Promise<void> => {
  try {
    await mongoConnect();
    console.log("Conexíón realizada correctamente.");

    const books = await Book.find();
    console.log(`Hemos recuperado ${books.length} libros de la base de datos`);
    const invalidBooks = [];
    const invalidPublishers = [];
    for (const book of books) {
      book.title = book.title.trim();
      book.pages = book.pages < 1 ? 1 : book.pages > 10000 ? 10000 : book.pages;
      if (book.title.length >= 3 && book.title.length <= 40) {
        await book.save();
        console.log(`Modificado libro ${book.title}`);
      } else {
        invalidBooks.push(book);
        await book.deleteOne();
      }
      if (book.publisher.name.length >= 3 && book.publisher.name.length <= 30) {
        await book.save();
        console.log(`Modificada editorial ${book.publisher.name}.`);
      } else {
        book.publisher = { name: "", country: "" };
        invalidPublishers.push(book.publisher);
      }
    }
    if (invalidBooks.length === 0) {
      console.log("Modificados todos los libros de nuestra base de datos");
    } else {
      console.log("No se han podido añadir los siguientes libros a la base de datos:");
      invalidBooks.forEach((invalidBook) => {
        console.log(invalidBook.title);
      });
      console.log("Motivo: El título no cumple con la longitud mínima o máxima de caracteres.");
    }
    if (invalidPublishers.length === 0) {
      console.log("Modificadas todas las editoriales de nuestra base de datos");
    } else {
      console.log("No se han podido añadir las siguientes editoriales a la base de datos:");
      invalidPublishers.forEach((invalidPublisher) => {
        console.log(invalidPublisher.name);
      });
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

void bookNormalization();
