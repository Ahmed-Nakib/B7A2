import type { Request, Response } from "express";
import { issuesService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";
import type { IUser } from "./issue.interface";

const createIssues = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const reporterID = req.user.id;

    const result = await issuesService.createIssuesIntoDB(
      req.body,
      reporterID as number,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const issues = await issuesService.getAllIssuesFromDB(req.query);

    const formatted = await issuesService.attachReporterToIssues(issues);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: formatted,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error,
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
        message: "Issue Not found",
        data: {},
      });
    }
    const issue = result.rows[0];
    if (!issue) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not found",
        data: null,
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully!",
      data: issue,
    });

    
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issuesService.updateIssueIntoDB(
      Number(id),
      req.body,
      req.user as IUser,
    );

    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
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
      });
    }

    if (error.message === "ISSUE_LOCKED") {
      return sendResponse(res, {
        statusCode: 409,
        success: false,
        message: "Only open issues can be updated",
      });
    }

    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issuesService.deleteIssueFromDB(Number(id), req.user as IUser);

    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden",
      });
    }

    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
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
