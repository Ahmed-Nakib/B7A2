import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/auth/auth.route";
import { issueRouter } from "./modules/issues/issues.route";
import auth from "./middleware/auth";


const app: Application = express()

app.use(express.json());


app.get('/api', (req: Request, res:Response) => {
  res.send('Hello World!')
})

app.use('/api/auth/', userRoute)
app.use('/api/issues', issueRouter)

export default app;