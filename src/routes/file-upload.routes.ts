import express, { type NextFunction, type Response, type Request } from "express";
import multer from "multer";
import fs from "fs";

export const fileUploadRouter = express.Router();

const upload = multer({ dest: "public" });

fileUploadRouter.post("/", upload.single("file"), (req: Request, res: Response, next: NextFunction) => {
  const originalName: string | undefined = req?.file?.originalname;
  const path: string | undefined = req?.file?.path;

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const newPath = `${path}_${originalName}`;

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`Path generado por multer: ${path}`);
  console.log("Nuevo path: " + newPath);

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  fs.renameSync(path as string, newPath);

  res.send("Fichero subido correctamente!");
  console.log("Fichero subido correctamente!");
});
