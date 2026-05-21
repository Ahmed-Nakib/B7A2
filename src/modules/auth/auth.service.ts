import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "./auth.interface.";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role = "contributor" } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  console.log(hashPassword);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hashPassword, role],
  );

  return result;
};

const loginUser = async (payload: any) => {
  const { password, email } = payload;

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }

  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });

  return {
    token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};

const getAllUsersFromDb = async () => {
  const result = await pool.query(`
    SELECT * FROM users
    `);

  return result;
};

export const authService = {
  createUserIntoDB,
  loginUser,
  getAllUsersFromDb,
};
