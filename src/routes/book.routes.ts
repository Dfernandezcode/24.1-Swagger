import express, { type NextFunction, type Response, type Request } from "express";

// Modelos
import { Book } from "../models/mongo/Book";

// Router propio de libros
export const bookRouter = express.Router();

// Middleware de paginación
bookRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Estamos en el middleware /car que comprueba parámetros");

    const page: number = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit: number = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      req.query.page = page as any;
      req.query.limit = limit as any;
      next();
    } else {
      console.log("Parámetros no válidos:");
      console.log(JSON.stringify(req.query));
      res.status(400).json({ error: "Params page or limit are not valid" });
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: READ
bookRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit }: any = req.query;
    const books = await Book.find()
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("author");

    // Número total de elementos
    const totalElements = await Book.countDocuments();
    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: books,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: READ
bookRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const book = await Book.findById(id).populate("author");
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

bookRouter.get("/title/:title", async (req: Request, res: Response, next: NextFunction) => {
  const title = req.params.title;

  try {
    const book = await Book.find({ title: new RegExp("^" + title.toLowerCase(), "i") }).populate("author");
    if (book?.length) {
      res.json(book);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE
bookRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = new Book(req.body);

    const createdBook = await book.save();
    return res.status(201).json(createdBook);
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE
bookRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const bookDeleted = await Book.findByIdAndDelete(id);
    if (bookDeleted) {
      res.json(bookDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: UPDATE
bookRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const bookUpdated = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (bookUpdated) {
      res.json(bookUpdated);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});
