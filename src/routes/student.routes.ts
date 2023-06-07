import { Router, type NextFunction, type Request, type Response } from "express";

// Typeorm
import { Student } from "../models/typeorm/Student";
import { AppDataSource } from "../databases/typeorm-datasource";
import { type Repository } from "typeorm";
import { Course } from "../models/typeorm/Course";

const studentRepository: Repository<Student> = AppDataSource.getRepository(Student);
const courseRepository: Repository<Course> = AppDataSource.getRepository(Course);

// Router
export const studentRouter = Router();

// CRUD: READ
studentRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const students: Student[] = await studentRepository.find({ relations: ["course"] });
    res.json(students);
  } catch (error) {
    next(error);
  }
});

studentRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const student = await studentRepository.findOne({
      where: {
        id: idReceivedInParams,
      },
      relations: ["course"],
    });

    if (!student) {
      res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
});

studentRouter.get("/firstName/:firstName", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firstNameReceivedInParams = req.params.firstName;

    const student = await studentRepository.find({
      where: {
        firstName: firstNameReceivedInParams,
      },
      relations: ["course"],
    });

    if (!student) {
      res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE
studentRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Construimos student
    const newStudent = new Student();

    let courseOfStudent;

    if (req.body.courseId) {
      courseOfStudent = await courseRepository.findOne({
        where: {
          id: req.body.courseId,
        },
      });

      if (!courseOfStudent) {
        res.status(404).json({ error: "Course not found" });
        return;
      }
    }

    // Asignamos valores
    Object.assign(newStudent, {
      ...req.body,
      course: courseOfStudent,
    });

    const studentSaved = await studentRepository.save(newStudent);

    res.status(201).json(studentSaved);
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE
studentRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const studentToRemove = await studentRepository.findOneBy({
      id: idReceivedInParams,
    });

    if (!studentToRemove) {
      res.status(404).json({ error: "Student not found" });
    } else {
      await studentRepository.remove(studentToRemove);
      res.json(studentToRemove);
    }
  } catch (error) {
    next(error);
  }
});

studentRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const studentToUpdate = await studentRepository.findOneBy({
      id: idReceivedInParams,
    });

    if (!studentToUpdate) {
      res.status(404).json({ error: "Student not found" });
    } else {
      let courseOfStudent;

      if (req.body.courseId) {
        courseOfStudent = await courseRepository.findOne({
          where: {
            id: req.body.courseId,
          },
        });

        if (!courseOfStudent) {
          res.status(404).json({ error: "Course not found" });
          return;
        }
      }

      // Asignamos valores
      Object.assign(studentToUpdate, {
        ...req.body,
        course: courseOfStudent,
      });

      const updatedStudent = await studentRepository.save(studentToUpdate);
      res.json(updatedStudent);
    }
  } catch (error) {
    next(error);
  }
});
