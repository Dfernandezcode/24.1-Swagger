import express, { type NextFunction, type Response, type Request } from "express";
import { sqlQuery } from "../databases/sql-db";
import { type ProgrammingLanguageBody } from "../models/sql/ProgrammingLanguage";
export const companiesRouter = express.Router();

// CRUD: READ
companiesRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await sqlQuery(`
      SELECT *
      FROM Tech_Companies
    `);
    const response = { data: rows };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// CRUD: READ
companiesRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const rows = await sqlQuery(`
      SELECT *
      FROM Tech_Companies
      WHERE id=${id}
    `);

    if (rows?.[0]) {
      const response = { data: rows?.[0] };
      res.json(response);
    } else {
      res.status(404).json({ error: "company not found" });
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE
companiesRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, foundedYear, employeesNumber, headquarters, ceo } = req.body as ProgrammingLanguageBody;

    const result = await sqlQuery(`
      INSERT INTO programming_languages (name, founded_year, employees_number, headquarters, ceo)
      VALUES (${name}, ${foundedYear}, ${employeesNumber}, ${headquarters}, ${ceo})
    `);

    // const params = [name, foundedYear, employeesNumber, headquarters, ceo];
    // const result = await sqlQuery(query, params);

    if (result) {
      return res.status(201).json({});
    } else {
      return res.status(500).json({ error: "Language not created" });
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE
companiesRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brandDeleted = null;
    if (brandDeleted) {
      res.json(brandDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// CRUD: UPDATE
companiesRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const { name, foundedYear, employeesNumber, headquarters, ceo } = req.body as ProgrammingLanguageBody;

    await sqlQuery(`
      UPDATE programming_languages
      SET name = ${name}, founded_year = ${foundedYear}, employees_number = ${employeesNumber} , headquarters = ${headquarters} ?, ceo = ${ceo}
      WHERE id = ${id}
    `);
    // const params = [name, foundedYear, employeesNumber, headquarters, ceo, id];
    // await sqlQuery(query, params);

    const rows = await sqlQuery(`
    SELECT *
    FROM Tech_Companies
    WHERE id=${id}
  `);

    if (rows?.[0]) {
      const response = { data: rows?.[0] };
      res.json(response);
    } else {
      res.status(404).json({ error: "company not found" });
    }
  } catch (error) {
    next(error);
  }
});
