import { pool } from "../../db";
import type { TIssue } from "./issues.interface";

const createIssuesIntoDB = async (payload: TIssue,  reporterID: any ) => {
  const { title, description, type,} = payload;
  const reporter_id = reporterID

  const result = await pool.query(
    `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, description, type, status,  reporter_id, created_at, updated_at
    `,
    [title, description, type, reporter_id]
  );

  return result;
};


const getAllIssuesFromDB = async () => {

  const result = await pool.query(`
    SELECT * FROM issues
    `)

    return result;
}



export const issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB
};