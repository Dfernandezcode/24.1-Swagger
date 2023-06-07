// Importamos jwt
import jwt from "jsonwebtoken";
// Cargamos variables de entorno
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

export const generateToken = (id: string, email: string): string => {
  if (!email || !id) {
    throw new Error("Email or authorId missing");
  }

  const payload = {
    authorId: id,
    authorEmail: email,
  };

  const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "1d" });
  return token;
};

export const verifyToken = (token: string): any => {
  if (!token) {
    throw new Error("Token is missing");
  }

  const result = jwt.verify(token, JWT_SECRET as string);
  return result;
};
