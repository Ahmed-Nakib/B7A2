import type { Request, Response } from "express";
import { issuesService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";
import type { ISingleIssueResponse, IUser } from "./issue.interface";

const createIssues = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        errors: "Authentication required",
      });
    }

    const reporterID = req.user.id;

    const result = await issuesService.createIssuesIntoDB(
      req.body,
      reporterID as number
    );

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
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

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const issues = await issuesService.getAllIssuesFromDB(req.query);
    const formatted = await issuesService.attachReporterToIssues(issues);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: formatted,
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

const singleIssues = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issuesService.singleIssuesFromDB(Number(id));

    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        errors: "Issue does not exist",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result.rows[0] as ISingleIssueResponse,
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

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issuesService.updateIssueIntoDB(
      Number(id),
      req.body,
      req.user as IUser
    );

    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        errors: "Issue does not exist",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        errors: "You do not have permission",
      });
    }

    if (error.message === "ISSUE_LOCKED") {
      return sendResponse(res, {
        statusCode: 409,
        success: false,
        message: "Conflict",
        errors: "Only open issues can be updated",
      });
    }

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issuesService.deleteIssueFromDB(
      Number(id),
      req.user as IUser
    );

    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        errors: "Issue does not exist",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
        errors: "You do not have permission",
      });
    }

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};

export const issuesController = {
  createIssues,
  getAllIssues,
  singleIssues,
  updateIssue,
  deleteIssue,
};