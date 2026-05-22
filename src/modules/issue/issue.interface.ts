export type ICreateIssue = {
  title: string;
  description: string;

  type: "bug" | "feature_request";
};

export type TIssue = {
  id: number;
  title: string;
  description: string;

  type: "bug" | "feature_request";

  status: "open" | "in_progress" | "resolved";

  reporter_id: number;

  created_at: Date;
  updated_at: Date;
};

export type TUpdateIssue = {
  title?: string;
  description?: string;

  type?: "bug" | "feature_request";

  status?: "open" | "in_progress" | "resolved";
};