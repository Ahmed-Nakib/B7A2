import { Router } from "express";
import { issuesController } from "./issue.controller";
import auth from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router()

router.post("/", auth(), issuesController.createIssues)
router.get("/", issuesController.getAllIssues)
router.get("/:id", issuesController.singleIssues)
router.patch("/:id", auth(), issuesController.updateIssue)
router.delete("/:id", auth(),requireRole(["maintainer", "contributor"]), issuesController.deleteIssue)


export const issueRouter = router;