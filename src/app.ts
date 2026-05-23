import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/auth/auth.route";
import { issueRouter } from "./modules/issue/issue.route";
import logger from "./middleware/logger";
import globalErrorHandler from "./middleware/globalErrorHandler";


const app: Application = express()

app.use(express.json());
app.use(logger);


app.get('/api', (req: Request, res:Response) => {
  res.status(200).json({
    message: "Hello World"
  })
})


app.use('/api/auth/', userRoute)
app.use('/api/issues', issueRouter)

app.use(globalErrorHandler);

export default app;