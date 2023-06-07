import { generateToken } from "../utils/token";
import { isAuth } from "../middlewares/auth.middleware";
import { Author } from "../models/mongo/Author";
import { Book } from "../models/mongo/Book";
import express, { type NextFunction, type Response, type Request } from "express";
import fs from "fs";
import bcrypt from "bcrypt";
import multer from "multer";
const upload = multer({ dest: "public" });

// Router propio de libros
export const authorRouter = express.Router();

// Middleware for page requests
// _________________________________________________________________

/**
 * @swagger
 * components:
 *  schemas:
 *    Author:
 *      type: object
 *      required:
 *        - email
 *        - password
 *        - name
 *        - country
 *      properties:
 *        email:
 *          type: string
 *          format: email
 *          description: Email of the author (e.g., john@example.com)
 *        password:
 *          type: string
 *          format: password
 *          description: Password of the author (min 8 characters)
 *        name:
 *          type: string
 *          description: Name of the author (min 3 characters, max 30 characters)
 *        country:
 *          type: string
 *          description: Country of the author (uppercase, e.g., SPAIN)
 *        profileImage:
 *          type: string
 *          description: URL of the author's profile image (optional)
 */
authorRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
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
// _________________________________________________________________

// CRUD: READ
/* GET /authors
   Get a list of authors with pagination */

/**
 * @swagger
 * /authors:
 *  get:
 *    summary: Get a list of authors with pagination
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *        description: Page number for pagination
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          minimum: 1
 *        description: Maximum number of authors per page
 *    responses:
 *      200:
 *        description: List of authors with pagination details
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                totalItems:
 *                  type: integer
 *                  description: Total number of authors
 *                totalPages:
 *                  type: integer
 *                  description: Total number of pages
 *                currentPage:
 *                  type: integer
 *                  description: Current page number
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Author'
 *      400:
 *        description: Invalid query parameters
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 */

authorRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit }: any = req.query;
    const authors = await Author.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // Número total de elementos
    const totalElements = await Author.countDocuments();
    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: authors,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});
// _________________________________________________________________

// CRUD: READ
/* GET /authors/:id
   Get an author by ID */

/**
 * @swagger
 * /authors/{id}:
 *  get:
 *    summary: Get an author by ID
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID of the author
 *    responses:
 *      200:
 *        description: Author found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Author'
 *      404:
 *        description: Author not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 */

authorRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const author = await Author.findById(id).select("+password");

    if (author) {
      const temporalAuthor = author.toObject();
      const includeBooks = req.query.includeBooks === "true";
      if (includeBooks) {
        const books = await Book.find({ author: id });
        temporalAuthor.books = books;
      }

      res.json(temporalAuthor);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});
// _________________________________________________________________
/* GET /authors/name/:name
   Search authors by name */

/**
 * @swagger
 * /authors/name/{name}:
 *  get:
 *    summary: Search authors by name
 *    parameters:
 *      - in: path
 *        name: name
 *        schema:
 *          type: string
 *        required: true
 *        description: Name of the author to search
 *    responses:
 *      200:
 *        description: Authors found
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Author'
 *      404:
 *        description: Authors not found
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Author'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 */

authorRouter.get("/name/:name", async (req: Request, res: Response, next: NextFunction) => {
  const name = req.params.name;

  try {
    const author = await Author.find({ name: new RegExp("^" + name.toLowerCase(), "i") });
    if (author?.length) {
      res.json(author);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    next(error);
  }
});
// _________________________________________________________________
// LOGIN DE AUTORES
/* POST /authors/login
   Author login */

/**
 * @swagger
 * /authors/login:
 *  post:
 *    summary: Author login
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *                description: Email of the author
 *              password:
 *                type: string
 *                format: password
 *                description: Password of the author
 *    responses:
 *      200:
 *        description: Successful login
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  description: JWT token for authentication
 *      400:
 *        description: Invalid request body
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 *      401:
 *        description: Unauthorized login
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 */

authorRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const email = req.body.email;
    // const password = req.body.password;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Se deben especificar los campos email y password" });
    }

    const author = await Author.findOne({ email }).select("+password");
    if (!author) {
      // return res.status(404).json({ error: "No existe un usuario con ese email" });
      // Por seguridad mejor no indicar qué usuarios no existen
      return res.status(401).json({ error: "Email y/o contraseña incorrectos" });
    }

    // Comprueba la pass
    const match = await bcrypt.compare(password, author.password);
    if (match) {
      // Quitamos password de la respuesta
      const authorWithoutPass: any = author.toObject();
      delete authorWithoutPass.password;

      // Generamos token JWT
      const jwtToken = generateToken(author._id.toString(), author.email);

      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Email y/o contraseña incorrectos" });
    }
  } catch (error) {
    next(error);
  }
});
// _____________________________________________________________________
// CRUD: CREATE
/* POST /authors
   Create a new author */

/**
 * @swagger
 * /authors:
 *  post:
 *    summary: Create a new author
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Author'
 *    responses:
 *      201:
 *        description: Author created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Author'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 */

authorRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const author = new Author(req.body);

    const createdAuthor = await author.save();
    return res.status(201).json(createdAuthor);
  } catch (error) {
    next(error);
  }
});

// _____________________________________________________________________
// CRUD: DELETE
/* DELETE /authors/:id
   Delete an author by ID */

/**
 * @swagger
 * /authors/{id}:
 *  delete:
 *    summary: Delete an author by ID
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID of the author to delete
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Author deleted
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Author'
 *      401:
 *        description: Unauthorized operation
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 *      404:
 *        description: Author not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 */

authorRouter.delete("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    if (req.author.id !== id && req.author.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const authorDeleted = await Author.findByIdAndDelete(id);
    if (authorDeleted) {
      res.json(authorDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// ____________________________________________________________________
// CRUD: UPDATE
/* PUT /authors/:id
   Update an author by ID */

/**
 * @swagger
 * /authors/{id}:
 *  put:
 *    summary: Update an author by ID
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID of the author to update
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Author'
 *    responses:
 *      200:
 *        description: Author updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Author'
 *      401:
 *        description: Unauthorized operation
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 *      404:
 *        description: Author not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 */

authorRouter.put("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    if (req.author.id !== id && req.author.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const authorToUpdate = await Author.findById(id);
    if (authorToUpdate) {
      Object.assign(authorToUpdate, req.body);
      await authorToUpdate.save();
      // Quitamos pass de la respuesta
      const authorToSend: any = authorToUpdate.toObject();
      delete authorToSend.password;
      res.json(authorToSend);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});
// ____________________________________________________________________
/* POST /authors/logo-upload
   Upload an author's logo */

/**
 * @swagger
 * /authors/logo-upload:
 *  post:
 *    summary: Upload an author's logo
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              logo:
 *                type: string
 *                format: binary
 *                description: Logo file to upload
 *              authorId:
 *                type: string
 *                description: ID of the author
 *    responses:
 *      200:
 *        description: Logo uploaded
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Author'
 *      400:
 *        description: Invalid request body
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 *      404:
 *        description: Author not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: Error message
 */

authorRouter.post("/logo-upload", upload.single("logo"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Renombrado de la imagen
    const originalName = req.file?.originalname as string;
    const path = req.file?.path as string;
    const newPath = path + "_" + originalName;
    fs.renameSync(path, newPath);

    // Busqueda de la marca
    const authorId = req.body.authorId;
    const author = await Author.findById(authorId);

    if (author) {
      author.profileImage = newPath;
      await author.save();
      res.json(author);

      console.log("Author modified correctly!!");
    } else {
      fs.unlinkSync(newPath);
      res.status(404).send("Author not found");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * securitySchemes:
 *  bearerAuth:
 *    type: http
 *    scheme: bearer
 *    bearerFormat: JWT
 */
