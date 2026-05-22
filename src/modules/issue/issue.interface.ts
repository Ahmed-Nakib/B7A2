export type IssueType = "bug" | "feature_request";

export type IssueStatus = "open" | "in_progress" | "resolved";

export type SortType = "newest" | "oldest";

export interface ICreateIssue {
  title: string;
  description: string;
  type: IssueType;
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

export interface IUser {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

export interface IIssueResponse {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  created_at: Date;
  updated_at: Date;
  reporter: IUser | null;
}