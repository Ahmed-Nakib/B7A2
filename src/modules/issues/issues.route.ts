import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";

const router = Router()

router.post("/", auth(), issuesController.createIssues)
router.get("/", issuesController.getAllIssues)
router.get("/:id", issuesController.singleIssues)
router.patch("/:id", issuesController.updateIssue)
router.delete("/:id", issuesController.deleteIssue)


export const issueRouter = router;