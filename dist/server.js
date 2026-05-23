
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT || 5e3,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(20) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20),

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            
            description TEXT NOT NULL CHECK(LENGTH(description) >= 20),

            type VARCHAR(20) NOT NULL CHECK (
              type IN ('bug', 'feature_request')
            ),

            status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (
             status IN ('open', 'in_progress', 'resolved')
            ),

            reporter_id INTEGER NOT NULL,


            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  if (!["contributor", "maintainer"].includes(role)) {
    throw new Error("Invalid role");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hashPassword, role]
  );
  return result;
};
var loginUser = async (payload) => {
  const { password, email } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwt.sign(jwtPayload, config_default.secret, {
    expiresIn: "1d"
  });
  return {
    token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var authService = {
  createUserIntoDB,
  loginUser
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  try {
    const result = await authService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
var userRoute = router;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issue/issue.service.ts
var createIssuesIntoDB = async (payload, reporterID) => {
  const { title, description, type } = payload;
  const reporter_id = reporterID;
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
var getAllIssuesFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
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
var attachReporterToIssues = async (issues) => {
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
    reporter: users.find((u) => u.id === issue.reporter_id)
  }));
};
var singleIssuesFromDB = async (id) => {
  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    return { rows: [] };
  }
  const issue = issueResult.rows[0];
  const userResult = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id = $1
    `,
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0];
  const finalData = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return { rows: [finalData] };
};
var updateIssueIntoDB = async (id, payload, user) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  if (issueResult.rows.length === 0) {
    return issueResult;
  }
  const issue = issueResult.rows[0];
  if (user.role !== "maintainer") {
    if (issue.reporter_id !== user.id) {
      throw new Error("FORBIDDEN");
    }
    if (issue.status !== "open") {
      throw new Error("ISSUE_LOCKED");
    }
    delete payload.status;
  }
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      status = COALESCE($4, status),
      updated_at = NOW()
    WHERE id = $5
    RETURNING *
    `,
    [title, description, type, status, id]
  );
  return result;
};
var deleteIssueFromDB = async (id, user) => {
  if (user.role !== "maintainer") {
    throw new Error("Forbidden");
  }
  const result = await pool.query(
    `DELETE FROM issues WHERE id=$1 RETURNING *`,
    [id]
  );
  return result;
};
var issuesService = {
  createIssuesIntoDB,
  getAllIssuesFromDB,
  attachReporterToIssues,
  singleIssuesFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/issue/issue.controller.ts
var createIssues = async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    const reporterID = req.user.id;
    const result = await issuesService.createIssuesIntoDB(
      req.body,
      reporterID
    );
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const issues = await issuesService.getAllIssuesFromDB(req.query);
    const formatted = await issuesService.attachReporterToIssues(issues);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: formatted
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var singleIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.singleIssuesFromDB(Number(id));
    if (result.rows.length === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not found",
        data: {}
      });
    }
    const issue = result.rows[0];
    if (!issue) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not found",
        data: null
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully!",
      data: issue
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.updateIssueIntoDB(
      Number(id),
      req.body,
      req.user
    );
    if (result.rows.length === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    if (error.message === "FORBIDDEN") {
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden"
      });
    }
    if (error.message === "ISSUE_LOCKED") {
      return sendResponse_default(res, {
        statusCode: 409,
        success: false,
        message: "Only open issues can be updated"
      });
    }
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.deleteIssueFromDB(Number(id), req.user);
    if (result.rows.length === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    if (error.message === "Forbidden") {
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Forbidden"
      });
    }
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issuesController = {
  createIssues,
  getAllIssues,
  singleIssues,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access"
        });
      }
      const decoded = jwt2.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `
              SELECT * FROM users WHERE email=$1
            `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User not found"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_middleware_default = auth;

// src/middleware/role.middleware.ts
var requireRole = (roles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions"
      });
    }
    next();
  };
};

// src/modules/issue/issue.route.ts
var router2 = Router2();
router2.post("/", auth_middleware_default(), issuesController.createIssues);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.singleIssues);
router2.patch("/:id", auth_middleware_default(), issuesController.updateIssue);
router2.delete("/:id", auth_middleware_default(), requireRole(["maintainer", "contributor"]), issuesController.deleteIssue);
var issueRouter = router2;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  console.log("Method - URL - Time:", req.method, req.url, Date.now());
  const log = `
Method -> ${req.method} - Time -> ${Date.now()} - URL -> ${req.url}
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(logger_default);
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Hello World"
  });
});
app.use("/api/auth/", userRoute);
app.use("/api/issues", issueRouter);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = async () => {
  await initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map