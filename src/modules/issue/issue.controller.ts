import type { Request, Response } from "express";
import { issuesService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";

const createIssues = async (req: Request, res: Response) => {
  try {

    const reporterID = req.user?.id;

    const result = await issuesService.createIssuesIntoDB(req.body, reporterID as string);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]

    })
  } catch (error: any) {
    sendResponse(res,{
      statusCode:500,
      success: false,
      message: error.message,
      error: error
    })
  }
};



const  getAllIssues = async (req: Request, res: Response) => {
  try {

    const reporterID =await req.user?.id;
    console.log(reporterID);
    

    const result = await issuesService.getAllIssuesFromDB();

    res.status(200).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }}



const singleIssues = async (req: Request, res: Response) => {
  
  try {
    const { id } = req.params;

    const result = await issuesService.singleIssuesFromDB(id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue Not found!",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully!",
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



const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issuesService.updateIssueIntoDB(
      id as any,
      req.body,
      req.user
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issuesService.deleteIssueFromDB(id as any, req.user);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const issuesController ={
  createIssues,
  getAllIssues,
  singleIssues,
  updateIssue,
  deleteIssue
}