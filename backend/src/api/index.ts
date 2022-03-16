import {Request, Response, NextFunction} from "express"
import loginRoute from "./loginRoute"
import productRoute from "./productRoute"
import schemaRoute from "./schemaRoute"
import userRoute from "./userRoute"



export default async function routes(req: Request, res: Response, next: NextFunction) {
    req.app.use("/login", loginRoute)
    req.app.use("/product", productRoute)
    req.app.use("/user", userRoute)
    req.app.use("/schemas", await schemaRoute)
    next()
}