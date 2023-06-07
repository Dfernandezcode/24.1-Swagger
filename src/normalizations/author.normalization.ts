import mongoose from "mongoose";
import { mongoConnect } from "../databases/mongo-db";
import { Author } from "../models/mongo/Author";

const authorNormalization = async (): Promise<void> => {
  try {
    await mongoConnect();
    console.log("Conexíón realizada correctamente.");
    const authors = await Author.find().select("+password");
    console.log(`Hemos recuperado ${authors.length} autores de la base de datos`);
    const allowedCountries: string[] = ["COLOMBIA", "ENGLAND", "RUSSIA", "UNITED STATES", "ARGENTINA", "CZECHOSLOVAKIA", "JAPAN", "NIGERIA"];
    const invalidAuthors: any[] = [];
    for (const author of authors) {
      const validCountry: string | undefined = allowedCountries.find((element) => element === author.country);
      if (validCountry) {
        author.name = author.name.trim();
        author.country = author.country.trim().toUpperCase();
        if (author.name.length >= 3 && author.name.length <= 30) {
          await author.save();
          console.log(`Modificado autor ${author.name}`);
        } else {
          // He decidido borrar los autores cuyo nombre no cumple la validación
          // y la otra opción sería actualizar los autores con un nombre valido.
          invalidAuthors.push(author);
          await author.deleteOne();
        }
      } else {
        // Borro el autor ya que no tiene un pais válido
        invalidAuthors.push(author);
        await author.deleteOne();
      }
    }
    if (invalidAuthors.length === 0) {
      console.log("Modificados todos los autores de nuestra base de datos");
    } else {
      console.log("No se han podido añadir los siguientes autores a la base de datos:");
      invalidAuthors.forEach((invalidAuthor) => {
        console.log(invalidAuthor.name);
      });
      console.log("Motivo: El nombre no cumple con la longitud mínima (3) o máxima (30) o el país no es válido.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

void authorNormalization();
