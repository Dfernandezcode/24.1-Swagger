import { bookRouter } from "./routes/book.routes";
import { authorRouter } from "./routes/author.routes";
import { fileUploadRouter } from "./routes/file-upload.routes";
import { companyRouter } from "./routes/company.routes";
import { studentRouter } from "./routes/student.routes";
import { courseRouter } from "./routes/course.routes";
import { type Request, type Response, type NextFunction, type ErrorRequestHandler } from "express";
import express from "express";
import cors from "cors";
import { mongoConnect } from "./databases/mongo-db";
import { sqlConnect } from "./databases/sql-db";
import { AppDataSource } from "./databases/typeorm-datasource";

import { swaggerOptions } from "./swagger-options";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
// --------------------------------------------------------------------------------------------

const main = async (): Promise<void> => {
  // Conexión a la BBDD
  const mongoDatabase = await mongoConnect();
  const sqlDatabase = await sqlConnect();
  const datasource = await AppDataSource.initialize();

  // Configuración del app
  const PORT = 3000;
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors({ origin: "http://localhost:3000" }));

  // Indicate to index.ts to open Swagger server in .api-docs
  // Swagger
  const specs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

  //  Middlewares de aplicación
  app.use((req: Request, res: Response, next: NextFunction) => {
    const date = new Date();
    console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date.toString()}`);
    next();
  });
  // Rutas
  const router = express.Router();
  router.get("/", (req: Request, res: Response) => {
    res.send(`
      <h3>Esta es la home de nuestra API.</h3>
      <p>Estamos usando la BBDD Mongo de ${mongoDatabase?.connection?.name as string}</p>
      <p>Estamos usando la BBDD SQL ${sqlDatabase?.config?.database as string} del host ${sqlDatabase?.config?.host as string}</p>
      <p>Estamos usando TypeORM con la BBDD: ${datasource.options.database as string}</p>
    `);
  });
  router.get("*", (req: Request, res: Response) => {
    res.status(404).send("Lo sentimos :( No hemos encontrado la página solicitada.");
  });

  // Usamos las rutas
  app.use("/book", bookRouter);
  app.use("/author", authorRouter);
  app.use("/public", express.static("public"));
  app.use("/file-upload", fileUploadRouter);
  app.use("/company", companyRouter);
  app.use("/student", studentRouter);
  app.use("/course", courseRouter);
  app.use("/", router);

  // Middleware de gestión de errores
  app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
    console.log("*** INICIO DE ERROR ***");
    console.log(`PETICIÓN FALLIDA: ${req.method} a la url ${req.originalUrl}`);
    console.log(err);
    console.log("*** FIN DE ERROR ***");

    // Truco para quitar el tipo a una variable
    const errorAsAny: any = err as unknown as any;

    if (err?.name === "ValidationError") {
      res.status(400).json(err);
    } else if (errorAsAny.errmsg && errorAsAny.errmsg?.indexOf("duplicate key") !== -1) {
      res.status(400).json({ error: errorAsAny.errmsg });
    } else if (errorAsAny?.code === "ER_NO_DEFAULT_FOR_FIELD") {
      res.status(400).json({ error: errorAsAny?.sqlMessage });
    } else {
      res.status(500).json(err);
    }
  });

  app.listen(PORT, () => {
    console.log(`app levantado en el puerto ${PORT}`);
  });
};
void main();
