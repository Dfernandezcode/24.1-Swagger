import { Router, type NextFunction, type Request, type Response } from "express";

// Typeorm
import { Course } from "../models/typeorm/Course";
import { AppDataSource } from "../databases/typeorm-datasource";
import { type Repository } from "typeorm";

const courseRepository: Repository<Course> = AppDataSource.getRepository(Course);

// Router
export const courseRouter = Router();

// CRUD: READ
courseRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses: Course[] = await courseRepository.find({ relations: ["students"] });
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

courseRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const course = await courseRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
      relations: ["students"],
    });

    if (!course) {
      res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
});

courseRouter.get("/name/:name", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nameReceivedInParams = req.params.name;

    const course = await courseRepository.findOne({
      where: {
        name: nameReceivedInParams,
      },
      relations: ["students"],
    });

    if (!course) {
      res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE
courseRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Construimos course
    const newCourse = new Course();

    // Asignamos valores
    Object.assign(newCourse, req.body);

    const courseSaved = await courseRepository.save(newCourse);

    res.status(201).json(courseSaved);
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE
courseRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const courseToRemove = await courseRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
      relations: ["students"],
    });

    if (!courseToRemove) {
      res.status(404).json({ error: "Course not found" });
    } else {
      // Quitar a los jugadores este equipo
      for (const student of courseToRemove.students) {
        student.course = null as any;
        await AppDataSource.manager.save(student);
      }

      await courseRepository.remove(courseToRemove);
      res.json(courseToRemove);
    }
  } catch (error) {
    next(error);
  }
});

courseRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const courseToUpdate = await courseRepository.findOneBy({
      id: idReceivedInParams,
    });

    if (!courseToUpdate) {
      res.status(404).json({ error: "Course not found" });
    } else {
      // Asignamos valores
      Object.assign(courseToUpdate, req.body);

      const updatedCourse = await courseRepository.save(courseToUpdate);
      res.json(updatedCourse);
    }
  } catch (error) {
    next(error);
  }
});
