export type IssueType = "bug" | "feature_request";

export type IssueStatus = "open" | "in_progress" | "resolved";

export type SortType = "newest" | "oldest";

export type QueryValue = string | number | boolean | Date | null;


export interface IUser {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

export interface IIssue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ISingleIssueResponse {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter: IUser;
  created_at: Date;
  updated_at: Date;
}


export interface IUpdateIssue {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}