import mongoose from "mongoose";
import { mongoConnect } from "../databases/mongo-db";
import { Author } from "../models/mongo/Author";

const authorSeed = async (): Promise<void> => {
  try {
    // Conectar a BBDD
    await mongoConnect();
    console.log("Tenemos conexión");
    // Borrar autores
    await Author.collection.drop();
    console.log("Autores eliminados");
    const authorList = [
      { email: "gabi@gmail.com", password: "12345678", name: "Gabriel García Márquez", country: "Colombia" },
      { email: "jane@gmail.com", password: "87654321", name: "Jane Austen", country: "England" },
      { email: "leo@gmail.com", password: "11111111", name: "Leo Tolstoy", country: "Russia" },
      { email: "virgi@gmail.com", password: "22222222", name: "Virginia Woolf", country: "England" },
      { email: "erny@gmail.com", password: "33333333", name: "Ernest Hemingway", country: "United States" },
      { email: "jorge@gmail.com", password: "44444444", name: "Jorge Luis Borges", country: "Argentina" },
      { email: "franz@gmail.com", password: "55555555", name: "Franz Kafka", country: "Czechoslovakia" },
      { email: "toni@gmail.com", password: "66666666", name: "Toni Morrison", country: "United States" },
      { email: "ruki@gmail.com", password: "77777777", name: "Haruki Murakami", country: "Japan" },
      { email: "chinu@gmail.com", password: "88888888", name: "Chinua Achebe", country: "Nigeria" },
    ];
    // Añadir autores
    const documents = authorList.map((author) => new Author(author));
    // await Author.insertMany(documents);
    for (let i = 0; i < documents.length; i++) {
      await documents[i].save();
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};
void authorSeed();
