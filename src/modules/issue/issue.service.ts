import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

const createIssuesIntoDB = async (payload: IIssue, reporterID: number) => {
  const { title, description, type } = payload;
  const reporter_id = reporterID;

  const result = await pool.query(
    `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, description, type, status,  reporter_id, created_at, updated_at
    `,
    [title, description, type, reporter_id],
  );

  return result;
};


const getAllIssuesFromDB = async (query: any): Promise<IIssue[]> => {
  const { sort = "newest", type, status } = query;

  let sql = `SELECT * FROM issues`;
  const conditions: string[] = [];
  const values: any[] = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }

  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  const result = await pool.query(sql, values);

  return result.rows;
};



const attachReporterToIssues = async (issues: any[]) => {
   if (issues.length === 0) return [];

  const userIds = [...new Set(issues.map((i) => i.reporter_id))];

  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [userIds]
  );

  const users = userResult.rows;

  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    reporter: users.find((u) => u.id === issue.reporter_id),
  }));
};




const singleIssuesFromDB = async (id: any) => {
  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id],
  );

  if (issueResult.rows.length === 0) {
    return { rows: [] };
  }

  const issue = issueResult.rows[0];

  const userResult = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id = $1
    `,
    [issue.reporter_id],
  );

  const reporter = userResult.rows[0];

  const finalData = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };

  return { rows: [finalData] };
};

const updateIssueIntoDB = async (id: string, payload: any, user: any) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id=$1`, [
    id,
  ]);

  if (issueResult.rows.length === 0) {
    return issueResult;
  }

  const issue = issueResult.rows[0];

  // maintainer OR owner check (contributor can only edit own + open)
  if (user.role !== "maintainer") {
    if (issue.reporter_id !== user.id || issue.status !== "open") {
      throw new Error("Forbidden");
    }
  }

  const { title, description, type } = payload;

  const result = await pool.query(
    `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = NOW()
    WHERE id = $4
    RETURNING *
    `,
    [title, description, type, id],
  );

  return result;
};

const deleteIssueFromDB = async (id: string, user: any) => {
  if (user.role !== "maintainer") {
    throw new Error("Forbidden");
  }

  const result = await pool.query(
    `DELETE FROM issues WHERE id=$1 RETURNING *`,
    [id],
  );

  return result;
};

export const issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
  attachReporterToIssues,
  singleIssuesFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB,
};
