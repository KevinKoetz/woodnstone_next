import {Request, Response, NextFunction} from "express"
import loginRoute from "./loginRoute"
import productRoute from "./productRoute"
import indexRoute from "./indexRoute"



export default function routes(req: Request, res: Response, next: NextFunction) {
    req.app.use("/login", loginRoute)
    req.app.use("/product", productRoute)
    req.app.use("/schemas", indexRoute)
    next()
}