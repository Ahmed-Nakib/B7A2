import type { Request, Response } from "express";
import { issuesService } from "./issues.service";

const createIssues = async (req: Request, res: Response) => {
  try {

    const reporterID =await req.user?.id;
    console.log(reporterID);
    

    const result = await issuesService.createIssuesIntoDB(req.body, reporterID);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
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


export const issuesController ={
  createIssues,
  getAllIssues
}