import mongoose, { type ObjectId } from "mongoose";
const Schema = mongoose.Schema;

// No uso array para validar countries ya que este dato lo genero con faker
// y me imagino que tendra una lista con todos los paises...
// const allowedCountries = [];

// Creamos la interface
export interface IBook {
  title: string;
  author: ObjectId;
  pages: number;
  publisher: {
    name: string;
    country: string;
  };
}

// Creamos el schema del libro
const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "El titulo no puede tener menos de 3 caracteres..."],
      maxLength: [40, "El titulo no puede tener mas de 40 caracteres..."],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
    },
    pages: {
      type: Number,
      required: false,
      min: [1, "El libro no puede tener menos de 1 página..."],
      max: [10000, "El libro no puede tener mas de 10.000 paginas... menudo tostón..."],
    },
    publisher: {
      type: {
        name: {
          type: String,
          required: true,
          trim: true,
          minLength: [3, "El nombre de la editorial no puede tener menos de 3 caracteres..."],
          maxLength: [40, "El nombre de la editorial no puede tener mas de 40 caracteres..."],
        },
        country: {
          type: String,
          required: true,
        },
      },
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Book = mongoose.model<IBook>("Book", bookSchema);
