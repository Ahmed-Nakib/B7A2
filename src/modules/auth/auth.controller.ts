import type { Request, Response } from "express";
import { authService } from "./auth.service";

const signup = async (req: Request, res: Response) => {
  try {
    const result = await authService.createUserIntoDB(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};





const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body);

    res.status(201).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};





const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await authService.getAllUsersFromDb()

    res.status(200).json({
      success: true,
      data: result.rows
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error
    })
  }
}

export const authController = {
  signup,
  login,
  getAllUsers
};