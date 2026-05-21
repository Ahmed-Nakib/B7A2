import type { NextFunction, Request, Response } from "express";

type Role = "contributor" | "maintainer";

export const requireRole = (roles: Role | Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const allowed = Array.isArray(roles) ? roles : [roles];

    if (!allowed.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions",
      });
    }

    next();
  };
};