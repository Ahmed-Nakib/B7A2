import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const signup = async (req: Request, res: Response) => {
  try {
    const result = await authService.createUserIntoDB(req.body);

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Authentication failed",
      errors: error.message,
    });
  }
};

export const authController = {
  signup,
  login,
};